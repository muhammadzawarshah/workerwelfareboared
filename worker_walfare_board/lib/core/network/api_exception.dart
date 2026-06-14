/// Thrown whenever the backend returns a non-2xx response or the request fails.
///
/// The NestJS backend wraps errors as `{ statusCode, message, error }` (message
/// may be a string or a list of validation strings). We flatten that into a
/// single readable [message] for the UI.
class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  bool get isUnauthorized => statusCode == 401;

  @override
  String toString() => message;
}
