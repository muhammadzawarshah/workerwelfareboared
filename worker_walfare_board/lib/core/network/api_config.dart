import 'package:flutter/foundation.dart' show kIsWeb;

/// Central configuration for talking to the Workers Welfare Board backend.
///
/// The backend (NestJS) runs on port 5000 and exposes every route under the
/// `/api` global prefix. Uploaded files are served (without the `/api` prefix)
/// under `/uploads/...`.
///
/// Run target → which host reaches the backend:
///   * Flutter web / desktop on same machine -> http://localhost:5000
///   * Android emulator      -> http://10.0.2.2:5000 (emulator alias for host localhost)
///   * Real phone (USB/WiFi) -> your PC LAN IP, e.g. http://192.168.1.10:5000
///
/// The default is chosen automatically per platform (web → localhost,
/// mobile/desktop → 10.0.2.2). Override for a real device or production with
/// a build-time define (no code change needed):
///   flutter run --dart-define=API_HOST=http://192.168.1.10:5000
///   flutter build apk --release --dart-define=API_HOST=https://api.yourdomain.com
class ApiConfig {
  const ApiConfig._();

  /// Explicit override via `--dart-define=API_HOST=...` (empty when not set).
  static const String _envHost = String.fromEnvironment('API_HOST');

  /// Host origin (no trailing slash, no `/api`).
  static String get host {
    if (_envHost.isNotEmpty) return _envHost;
    // A browser cannot reach the emulator alias 10.0.2.2 — it must use localhost.
    return kIsWeb ? 'http://localhost:5000' : 'http://10.0.2.2:5000';
  }

  /// Base for all REST calls.
  static String get baseUrl => '$host/api';

  /// Resolve a stored media/relative path (e.g. a `profile_photo`) to a full URL.
  static String mediaUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    final normalized = path.startsWith('/') ? path : '/$path';
    return '$host$normalized';
  }

  static const Duration timeout = Duration(seconds: 30);
}
