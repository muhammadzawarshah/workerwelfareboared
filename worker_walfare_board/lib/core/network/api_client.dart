import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import 'api_config.dart';
import 'api_exception.dart';

/// Thin REST client for the Workers Welfare Board backend.
///
/// * Attaches the JWT `Authorization: Bearer <token>` header automatically.
/// * Unwraps the standard envelope `{ success, message, data, meta }` and
///   returns just the `data` payload (or the full envelope via [getList]).
/// * Converts non-2xx responses into [ApiException] with a readable message.
class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  /// Current bearer token. Set by the auth store after login / hydration.
  static String? token;

  Map<String, String> _headers({bool json = true}) {
    return {
      if (json) 'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null && token!.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Uri _uri(String path, [Map<String, dynamic>? query]) {
    final normalized = path.startsWith('/') ? path : '/$path';
    Map<String, String>? cleaned;
    if (query != null) {
      cleaned = <String, String>{};
      query.forEach((k, v) {
        final s = v?.toString() ?? '';
        if (s.isNotEmpty) cleaned![k] = s;
      });
      if (cleaned.isEmpty) cleaned = null;
    }
    return Uri.parse('${ApiConfig.baseUrl}$normalized').replace(queryParameters: cleaned);
  }

  // ── Verbs ──────────────────────────────────────────────────────────────────

  /// GET returning the unwrapped `data` payload.
  Future<dynamic> get(String path, {Map<String, dynamic>? query}) async {
    final res = await _send(() => http.get(_uri(path, query), headers: _headers()));
    return _unwrap(res).data;
  }

  /// GET returning the full envelope (so callers can read `meta.total`, etc.).
  Future<ApiResult> getList(String path, {Map<String, dynamic>? query}) async {
    final res = await _send(() => http.get(_uri(path, query), headers: _headers()));
    return _unwrap(res);
  }

  /// GET returning a `List<Map<String, dynamic>>` (most list endpoints).
  Future<List<Map<String, dynamic>>> getRows(String path, {Map<String, dynamic>? query}) async {
    final data = await get(path, query: query);
    return _asRows(data);
  }

  Future<dynamic> post(String path, {Object? body}) async {
    final res = await _send(
      () => http.post(_uri(path), headers: _headers(), body: jsonEncode(body ?? {})),
    );
    return _unwrap(res).data;
  }

  Future<dynamic> put(String path, {Object? body}) async {
    final res = await _send(
      () => http.put(_uri(path), headers: _headers(), body: jsonEncode(body ?? {})),
    );
    return _unwrap(res).data;
  }

  Future<dynamic> patch(String path, {Object? body}) async {
    final res = await _send(
      () => http.patch(_uri(path), headers: _headers(), body: jsonEncode(body ?? {})),
    );
    return _unwrap(res).data;
  }

  Future<dynamic> delete(String path, {Object? body}) async {
    final res = await _send(
      () => http.delete(_uri(path), headers: _headers(), body: body == null ? null : jsonEncode(body)),
    );
    return _unwrap(res).data;
  }

  /// Multipart upload (documents, profile photos). [fields] become form fields,
  /// [file] is attached under [fileField] (default `file`).
  Future<dynamic> upload(
    String path, {
    required File file,
    String fileField = 'file',
    Map<String, String> fields = const {},
  }) async {
    final request = http.MultipartRequest('POST', _uri(path))
      ..headers.addAll(_headers(json: false))
      ..fields.addAll(fields)
      ..files.add(await http.MultipartFile.fromPath(fileField, file.path));
    final streamed = await request.send().timeout(ApiConfig.timeout);
    final res = await http.Response.fromStream(streamed);
    return _unwrap(res).data;
  }

  /// Download raw bytes (e.g. a document file) with auth header.
  Future<List<int>> downloadBytes(String path) async {
    final res = await _send(() => http.get(_uri(path), headers: _headers(json: false)));
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw ApiException('Download failed', statusCode: res.statusCode);
    }
    return res.bodyBytes;
  }

  // ── Internals ────────────────────────────────────────────────────────────────

  Future<http.Response> _send(Future<http.Response> Function() run) async {
    try {
      return await run().timeout(ApiConfig.timeout);
    } on SocketException {
      throw ApiException('Cannot reach the server. Make sure the backend is running.');
    } on HttpException {
      throw ApiException('Network error while contacting the server.');
    } catch (e) {
      throw ApiException('Request failed: $e');
    }
  }

  ApiResult _unwrap(http.Response res) {
    dynamic body;
    if (res.body.isNotEmpty) {
      try {
        body = jsonDecode(res.body);
      } catch (_) {
        body = null;
      }
    }

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw ApiException(_extractError(body, res.statusCode), statusCode: res.statusCode);
    }

    if (body is Map<String, dynamic>) {
      return ApiResult(
        data: body.containsKey('data') ? body['data'] : body,
        message: body['message']?.toString() ?? '',
        meta: body['meta'] is Map<String, dynamic> ? body['meta'] as Map<String, dynamic> : null,
      );
    }
    return ApiResult(data: body, message: '', meta: null);
  }

  String _extractError(dynamic body, int status) {
    if (body is Map<String, dynamic>) {
      final msg = body['message'];
      if (msg is String && msg.isNotEmpty) return msg;
      if (msg is List && msg.isNotEmpty) return msg.map((e) => e.toString()).join('\n');
      if (body['error'] is String) return body['error'] as String;
    }
    return 'Request failed (HTTP $status)';
  }

  List<Map<String, dynamic>> _asRows(dynamic data) {
    if (data is List) {
      return data.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
    }
    if (data is Map<String, dynamic>) {
      // Some endpoints may nest the array under `items` / `rows`.
      for (final key in ['items', 'rows', 'data']) {
        final v = data[key];
        if (v is List) {
          return v.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
        }
      }
    }
    return const [];
  }
}

/// Unwrapped backend envelope.
class ApiResult {
  ApiResult({required this.data, required this.message, this.meta});

  final dynamic data;
  final String message;
  final Map<String, dynamic>? meta;

  List<Map<String, dynamic>> get rows {
    if (data is List) {
      return (data as List).whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
    }
    return const [];
  }

  int get total => (meta?['total'] as num?)?.toInt() ?? rows.length;
}
