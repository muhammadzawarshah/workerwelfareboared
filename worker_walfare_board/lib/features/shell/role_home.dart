import 'package:flutter/material.dart';

import '../../core/auth/auth_store.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_nav.dart';
import '../../core/constants/app_roles.dart';
import '../../data/models/app_user.dart';
import '../../data/services/auth_service.dart';
import '../../routes/app_routes.dart';
import '../dashboards/applications/applications_screen.dart';
import '../dashboards/assets/assets_setup_screen.dart';
import '../dashboards/caretaker/caretaker_duty_screen.dart';
import '../dashboards/colony/caretaker_control_screen.dart';
import '../dashboards/colony/allotment_desk_screen.dart';
import '../dashboards/committee/committee_desk_screen.dart';
import '../dashboards/common/managed_lists.dart';
import '../dashboards/common/resource_list_screen.dart';
import '../dashboards/complaints/complaints_screen.dart';
import '../dashboards/overview/director_overview_screen.dart';
import '../dashboards/finance/accounts_screen.dart';
import '../dashboards/finance/rent_screen.dart';
import '../dashboards/finance/utilities_screen.dart';
import '../dashboards/industry/new_application_screen.dart';
import '../dashboards/security/evictions_screen.dart';
import '../dashboards/verification/verification_desk_screen.dart';

/// Generic dashboard shell shared by every role. Renders a drawer built from
/// [AppNav] and swaps the body based on the selected nav key — a mobile mirror
/// of the website's Sidebar + `renderScreen()`.
class RoleHome extends StatefulWidget {
  const RoleHome({super.key});

  @override
  State<RoleHome> createState() => _RoleHomeState();
}

class _RoleHomeState extends State<RoleHome> {
  late String _active;
  AppUser get _user => AuthStore.instance.user!;
  String get _role => _user.role;

  @override
  void initState() {
    super.initState();
    _active = AppNav.defaultScreen(_role);
  }

  void _select(String key) {
    setState(() => _active = key);
    Navigator.of(context).maybePop(); // close drawer
  }

  Future<void> _logout() async {
    await AuthService.instance.logout();
    if (!mounted) return;
    Navigator.of(context).pushNamedAndRemoveUntil(AppRoutes.login, (_) => false);
  }

  String get _activeTitle {
    for (final g in AppNav.groupsForRole(_role)) {
      for (final i in g.items) {
        if (i.key == _active) return i.label;
      }
    }
    return AppRoles.label(_role);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(_activeTitle),
        actions: [
          IconButton(
            tooltip: 'Notifications',
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => _select('notifications'),
          ),
        ],
      ),
      drawer: _buildDrawer(),
      body: SafeArea(
        child: ScreenDispatcher(
          role: _role,
          navKey: _active,
          user: _user,
          onNavigate: (key) => setState(() => _active = key),
        ),
      ),
    );
  }

  Widget _buildDrawer() {
    final groups = AppNav.groupsForRole(_role);
    return Drawer(
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              color: AppColors.primaryDark,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: AppColors.primary,
                    child: Text(
                      _user.name.isNotEmpty ? _user.name[0].toUpperCase() : '?',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(_user.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                  Text(AppRoles.label(_role), style: const TextStyle(color: Colors.white70, fontSize: 12)),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  for (final group in groups) ...[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
                      child: Text(
                        group.label.toUpperCase(),
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textLight, letterSpacing: 0.5),
                      ),
                    ),
                    for (final item in group.items)
                      ListTile(
                        dense: true,
                        selected: item.key == _active,
                        selectedTileColor: AppColors.primary.withValues(alpha: 0.08),
                        leading: Icon(item.icon, size: 20, color: item.key == _active ? AppColors.primary : AppColors.textSecondary),
                        title: Text(
                          item.label,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: item.key == _active ? FontWeight.w700 : FontWeight.w500,
                            color: item.key == _active ? AppColors.primary : AppColors.textPrimary,
                          ),
                        ),
                        onTap: () => _select(item.key),
                      ),
                  ],
                ],
              ),
            ),
            const Divider(height: 1),
            ListTile(
              leading: const Icon(Icons.logout, color: AppColors.error),
              title: const Text('Logout', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w600)),
              onTap: _logout,
            ),
          ],
        ),
      ),
    );
  }
}

/// Maps a (role, navKey) to the right screen widget. Real screens are wired in
/// as each role is built; anything not yet implemented shows [ComingSoon].
class ScreenDispatcher extends StatelessWidget {
  const ScreenDispatcher({
    super.key,
    required this.role,
    required this.navKey,
    required this.user,
    required this.onNavigate,
  });
  final String role;
  final String navKey;
  final AppUser user;
  final void Function(String navKey) onNavigate;

  @override
  Widget build(BuildContext context) {
    // Screens shared across roles.
    switch (navKey) {
      case 'notifications':
        return ResourceLists.notifications();
      case 'caretakerAttendance':
        return ResourceLists.attendance();
      case 'caretakerGps':
        return ResourceLists.gps();
      case 'taskProofs':
        return ResourceLists.taskProofs();
      case 'allottees':
        return ResourceLists.allottees();
      // Manageable (create/edit/delete) resources.
      case 'zones':
        return ManagedLists.zones();
      case 'colonies':
        return ManagedLists.colonies();
      case 'districts':
        return ManagedLists.districts();
      case 'units':
        return ManagedLists.units();
      case 'assets':
        return ManagedLists.assets();
      case 'staff':
        return ManagedLists.staff();
    }

    // Caretaker.
    if (navKey == 'caretakerDuty') return const CaretakerDutyScreen();

    // Applications list (industry_admin, committee_admin, director).
    if (navKey == 'applications') return const ApplicationsScreen();

    // Industry portal.
    if (navKey == 'newApplication') return NewApplicationScreen(onSubmitted: () {});

    // Finance.
    if (navKey == 'accounts') return const AccountsScreen();
    if (navKey == 'rent') return const RentScreen();
    if (navKey == 'utilities') return const UtilitiesScreen();

    // Colony admin.
    if (navKey == 'maintenance') return const CaretakerControlScreen();
    if (navKey == 'complaints') return const ComplaintsScreen();

    // Verification desk.
    if (navKey == 'verificationDesk') return const VerificationDeskScreen();

    // Committee desk.
    if (navKey == 'committeeDesk') return const CommitteeDeskScreen();

    // AD (Colonies) allotment desk — assign flat + notification for approved apps.
    if (navKey == 'allotment') return const AllotmentDeskScreen();

    // Assets admin.
    if (navKey == 'assetsSetup') return const AssetsSetupScreen();

    // Security / evictions.
    if (navKey == 'evictions') return const EvictionsScreen();

    // Director overview.
    if (navKey == 'director') return DirectorOverviewScreen(onOpen: onNavigate);

    // Anything not yet wired.
    return ComingSoon(label: navKey);
  }
}

class ComingSoon extends StatelessWidget {
  const ComingSoon({super.key, required this.label});
  final String label;
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.construction_outlined, size: 48, color: AppColors.textLight),
            const SizedBox(height: 12),
            Text('"$label" screen', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            const Text('Yeh screen jald wire ho rahi hai.', style: TextStyle(color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}
