// Basic smoke test: the login screen renders its key elements.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:worker_walfare_board/features/auth/login_page.dart';

void main() {
  testWidgets('Login page renders sign-in form', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: LoginPage()));

    expect(find.text('Sign In'), findsOneWidget);
    expect(find.text('Sign in to Portal'), findsOneWidget);
    expect(find.byType(TextField), findsNWidgets(2)); // email + password
  });
}
