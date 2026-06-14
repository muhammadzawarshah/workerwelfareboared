import 'package:flutter/material.dart';

import '../core/auth/auth_store.dart';
import '../features/auth/login_page.dart';
import '../features/auth/welcome_page.dart';
import '../features/shell/role_home.dart';
import '../features/splash/splash_page.dart';
import 'app_routes.dart';

/// Minimal, role-driven routing. After login every role lands on [RoleHome],
/// which renders the correct dashboard from the authenticated user's role.
class RouteGenerator {
  const RouteGenerator._();

  static Route<dynamic> generate(RouteSettings settings) {
    switch (settings.name) {
      case AppRoutes.splash:
        return _page(const SplashPage(), settings);
      case AppRoutes.login:
        return _page(const LoginPage(), settings);
      case AppRoutes.home:
        return _page(const RoleHome(), settings);
      case AppRoutes.intro:
      default:
        // Decide the landing screen from the stored session.
        final loggedIn = AuthStore.instance.isLoggedIn;
        return _page(loggedIn ? const RoleHome() : const WelcomePage(), settings);
    }
  }

  static MaterialPageRoute _page(Widget child, RouteSettings settings) =>
      MaterialPageRoute(builder: (_) => child, settings: settings);
}
