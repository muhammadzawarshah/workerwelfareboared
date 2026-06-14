import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../network/api_client.dart';
import '../../data/models/app_user.dart';

/// Persists the JWT token + logged-in user across app launches, and keeps
/// [ApiClient.token] in sync so every request is authenticated.
class AuthStore {
  AuthStore._();
  static final AuthStore instance = AuthStore._();

  static const _tokenKey = 'wwb_token';
  static const _userKey = 'wwb_user';

  AppUser? _user;
  String? _token;

  AppUser? get user => _user;
  String? get token => _token;
  bool get isLoggedIn => (_token != null && _token!.isNotEmpty) && _user != null;

  /// Load any previously stored session. Call once at startup.
  Future<void> hydrate() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
    final rawUser = prefs.getString(_userKey);
    if (rawUser != null) {
      try {
        _user = AppUser.fromJson(jsonDecode(rawUser) as Map<String, dynamic>);
      } catch (_) {
        _user = null;
      }
    }
    ApiClient.token = _token;
  }

  Future<void> save(String token, AppUser user) async {
    _token = token;
    _user = user;
    ApiClient.token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  Future<void> clear() async {
    _token = null;
    _user = null;
    ApiClient.token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }
}
