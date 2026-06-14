import '../../core/auth/auth_store.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../models/app_user.dart';

/// Authentication against the backend `/auth/*` endpoints.
class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  final _api = ApiClient.instance;

  /// POST `/auth/login` -> `{ token, user }`. Persists the session on success.
  Future<AppUser> login(String email, String password) async {
    final data = await _api.post('/auth/login', body: {
      'email': email.trim(),
      'password': password,
    });

    if (data is! Map<String, dynamic>) {
      throw ApiException('Unexpected login response from server.');
    }
    final token = data['token']?.toString();
    final userJson = data['user'];
    if (token == null || token.isEmpty || userJson is! Map<String, dynamic>) {
      throw ApiException('Login failed: malformed server response.');
    }

    final user = AppUser.fromJson(userJson);
    await AuthStore.instance.save(token, user);
    return user;
  }

  Future<void> logout() async {
    try {
      await _api.post('/auth/logout');
    } catch (_) {
      // Logout is best-effort; clear the local session regardless.
    }
    await AuthStore.instance.clear();
  }
}
