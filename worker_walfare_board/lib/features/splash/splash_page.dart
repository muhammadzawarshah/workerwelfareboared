import 'dart:async';

import 'package:flutter/material.dart';

import '../../core/auth/auth_store.dart';
import '../../core/constants/app_colors.dart';
import '../../routes/app_routes.dart';

/// Branded splash shown on cold start. After a short delay it routes to the
/// dashboard (if a session is restored) or the welcome/login screen.
class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer(const Duration(milliseconds: 2500), _go);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _go() {
    if (!mounted) return;
    final next = AuthStore.instance.isLoggedIn ? AppRoutes.home : AppRoutes.intro;
    Navigator.of(context).pushReplacementNamed(next);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 24, offset: Offset(0, 10))],
                ),
                child: Image.asset(
                  'assets/images/kp_logo.png',
                  width: 140,
                  height: 140,
                  fit: BoxFit.contain,
                  errorBuilder: (_, __, ___) => const Icon(Icons.account_balance, size: 100, color: AppColors.primary),
                ),
              ),
              const SizedBox(height: 26),
              const Text(
                'Worker Welfare Board',
                style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: 0.3),
              ),
              const SizedBox(height: 6),
              const Text(
                'Government of Khyber Pakhtunkhwa',
                style: TextStyle(color: Colors.white70, fontSize: 13),
              ),
              const SizedBox(height: 30),
              const SizedBox(
                width: 26,
                height: 26,
                child: CircularProgressIndicator(strokeWidth: 2.5, valueColor: AlwaysStoppedAnimation(Colors.white)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
