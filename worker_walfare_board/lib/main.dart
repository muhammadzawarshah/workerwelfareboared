import 'package:flutter/material.dart';

import 'core/auth/auth_store.dart';
import 'core/theme/app_theme.dart';
import 'routes/app_routes.dart';
import 'routes/route_generator.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Restore any saved JWT session before deciding the first screen.
  await AuthStore.instance.hydrate();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      // Decide the very first screen from the stored session on every cold
      // start (including web refresh / hot restart). We ignore the route name
      // the platform hands us, because on web Flutter would otherwise restore
      // whatever path is in the URL bar (e.g. /login) and bypass this check.
      // Always boot into the branded splash; it then routes to the dashboard
      // (restored session) or the welcome/login screen.
      onGenerateInitialRoutes: (_) => [
        RouteGenerator.generate(const RouteSettings(name: AppRoutes.splash)),
      ],
      onGenerateRoute: RouteGenerator.generate,
    );
  }
}
