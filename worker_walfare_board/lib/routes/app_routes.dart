/// Application route names. The app is role-driven: after login every role
/// lands on [home] (the [RoleHome] shell), which renders the correct dashboard.
class AppRoutes {
  const AppRoutes._();

  static const splash = '/splash';
  static const intro = '/';
  static const login = '/login';

  /// Role-aware dashboard shell (the app lands here after login).
  static const home = '/home';
}
