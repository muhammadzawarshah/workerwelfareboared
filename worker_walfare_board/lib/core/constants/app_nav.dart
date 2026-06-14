import 'package:flutter/material.dart';

import 'app_roles.dart';

/// A single navigation destination inside a role's dashboard shell.
class NavItem {
  const NavItem(this.key, this.label, this.icon);
  final String key;
  final String label;
  final IconData icon;
}

/// A labelled group of nav items (mirrors the website's sidebar groups).
class NavGroup {
  const NavGroup(this.label, this.items);
  final String label;
  final List<NavItem> items;
}

/// Navigation per role — a mobile mirror of the website's `navGroupsForRole`.
/// System roles (super_admin, admin) are not surfaced in the mobile app.
class AppNav {
  const AppNav._();

  static List<NavGroup> groupsForRole(String role) {
    switch (role) {
      // Super Admin / Admin: full access to every screen the app implements.
      case AppRoles.superAdmin:
      case AppRoles.admin:
        return const [
          NavGroup('Overview', [
            NavItem('director', 'Dashboard', Icons.dashboard_outlined),
            NavItem('applications', 'Applications', Icons.description_outlined),
            NavItem('allottees', 'Allottees', Icons.groups_2_outlined),
          ]),
          NavGroup('Colonies & Assets', [
            NavItem('zones', 'Zones', Icons.map_outlined),
            NavItem('colonies', 'Colonies', Icons.location_city_outlined),
            NavItem('units', 'Units', Icons.home_work_outlined),
            NavItem('districts', 'Districts', Icons.public_outlined),
            NavItem('assetsSetup', 'Assets Dashboard', Icons.dashboard_customize_outlined),
            NavItem('assets', 'Assets', Icons.inventory_2_outlined),
            NavItem('evictions', 'Evictions', Icons.gavel_outlined),
          ]),
          NavGroup('Finance', [
            NavItem('accounts', 'Accounts Dashboard', Icons.account_balance_outlined),
            NavItem('rent', 'Rent Collection', Icons.payments_outlined),
            NavItem('utilities', 'Utility Bills', Icons.bolt_outlined),
          ]),
          NavGroup('Workflow', [
            NavItem('verificationDesk', 'Verification', Icons.fact_check_outlined),
            NavItem('committeeDesk', 'Committee Desk', Icons.groups_outlined),
            NavItem('allotment', 'Allotment Desk', Icons.assignment_turned_in_outlined),
            NavItem('complaints', 'Complaints', Icons.support_agent_outlined),
            NavItem('maintenance', 'Caretaker Control', Icons.engineering_outlined),
          ]),
          NavGroup('Caretaker', [
            NavItem('caretakerDuty', 'Caretaker Duty', Icons.badge_outlined),
            NavItem('caretakerAttendance', 'Attendance Logs', Icons.fact_check_outlined),
            NavItem('caretakerGps', 'GPS Tracking', Icons.location_on_outlined),
            NavItem('taskProofs', 'Task Proofs', Icons.image_outlined),
          ]),
          NavGroup('People & System', [
            NavItem('staff', 'Staff & Users', Icons.badge_outlined),
            NavItem('notifications', 'Notifications', Icons.notifications_outlined),
          ]),
        ];
      case AppRoles.industryAdmin:
        return const [
          NavGroup('Industry Portal', [
            NavItem('newApplication', 'Apply / Allotment', Icons.add_task_outlined),
            NavItem('applications', 'Applications', Icons.description_outlined),
            NavItem('allottees', 'My Workers', Icons.groups_2_outlined),
          ]),
          NavGroup('Updates', [
            NavItem('notifications', 'Notifications', Icons.notifications_outlined),
          ]),
        ];
      case AppRoles.colonySection:
        return const [
          NavGroup('Colony Section', [
            NavItem('verificationDesk', 'Workers Verification', Icons.fact_check_outlined),
            NavItem('applications', 'Applications', Icons.description_outlined),
            NavItem('allottees', 'Allottees', Icons.groups_2_outlined),
            NavItem('colonies', 'Colonies', Icons.location_city_outlined),
            NavItem('units', 'Unit Status', Icons.home_work_outlined),
            NavItem('notifications', 'Notifications', Icons.notifications_outlined),
          ]),
        ];
      case AppRoles.secretaryKpWwb:
      case AppRoles.chairmanKpWwb:
        return const [
          NavGroup('Committee', [
            NavItem('committeeDesk', 'Committee Desk', Icons.groups_outlined),
            NavItem('applications', 'Applications', Icons.description_outlined),
            NavItem('notifications', 'Notifications', Icons.notifications_outlined),
          ]),
        ];
      // Caretaker is the on-ground colony admin (legacy colony_admin + caretaker merged).
      case AppRoles.careTakerLabourColony:
        return const [
          NavGroup('Caretaker', [
            NavItem('caretakerDuty', 'Caretaker Duty', Icons.badge_outlined),
            NavItem('applications', 'Applications', Icons.description_outlined),
            NavItem('complaints', 'Complaints', Icons.support_agent_outlined),
            NavItem('rent', 'Rent Collection', Icons.payments_outlined),
            NavItem('caretakerAttendance', 'Attendance Logs', Icons.fact_check_outlined),
            NavItem('caretakerGps', 'GPS Tracking', Icons.location_on_outlined),
            NavItem('notifications', 'Notifications', Icons.notifications_outlined),
          ]),
        ];
      case AppRoles.worksWing:
        return const [
          NavGroup('Works Wing', [
            NavItem('assetsSetup', 'Assets Dashboard', Icons.dashboard_outlined),
            NavItem('colonies', 'Colonies', Icons.location_city_outlined),
            NavItem('units', 'Flats', Icons.home_work_outlined),
            NavItem('assets', 'Colony Assets', Icons.inventory_2_outlined),
            NavItem('complaints', 'Complaints', Icons.support_agent_outlined),
            NavItem('notifications', 'Notifications', Icons.notifications_outlined),
          ]),
        ];
      // Assistant Directors (Colonies) oversee all colonies in their zone.
      case AppRoles.adColoniesZone1:
      case AppRoles.adColoniesZone2:
        return const [
          NavGroup('Colonies (Zone)', [
            NavItem('director', 'Dashboard', Icons.dashboard_outlined),
            NavItem('applications', 'Applications', Icons.description_outlined),
            NavItem('allotment', 'Allotment Desk', Icons.assignment_turned_in_outlined),
            NavItem('allottees', 'Allottees', Icons.groups_2_outlined),
            NavItem('zones', 'Zones', Icons.map_outlined),
            NavItem('colonies', 'Colonies', Icons.location_city_outlined),
            NavItem('units', 'Unit Status', Icons.home_work_outlined),
            NavItem('evictions', 'Evictions', Icons.gavel_outlined),
            NavItem('complaints', 'Complaints', Icons.support_agent_outlined),
            NavItem('notifications', 'Notifications', Icons.notifications_outlined),
          ]),
        ];
      case AppRoles.legalSection:
        return const [
          NavGroup('Legal Section', [
            NavItem('evictions', 'Illegal Occupants', Icons.gavel_outlined),
            NavItem('notifications', 'Notifications', Icons.notifications_outlined),
          ]),
        ];
      case AppRoles.financeWing:
        return const [
          NavGroup('Finance Wing', [
            NavItem('accounts', 'Accounts Dashboard', Icons.account_balance_outlined),
            NavItem('rent', 'Rent Collection', Icons.payments_outlined),
            NavItem('utilities', 'Utility Bills', Icons.bolt_outlined),
            NavItem('notifications', 'Notifications', Icons.notifications_outlined),
          ]),
        ];
      case AppRoles.recoveriesRent:
        return const [
          NavGroup('Recoveries / Rent', [
            NavItem('rent', 'Rent Collection', Icons.payments_outlined),
            NavItem('notifications', 'Notifications', Icons.notifications_outlined),
          ]),
        ];
      case AppRoles.deputyDirectorGahr:
        return const [
          NavGroup('General Admin & HR', [
            NavItem('staff', 'Staff', Icons.badge_outlined),
            NavItem('notifications', 'Notifications', Icons.notifications_outlined),
          ]),
        ];
      case AppRoles.directorAdmin:
      default:
        return const [
          NavGroup('Colony Section', [
            NavItem('director', 'Dashboard', Icons.dashboard_outlined),
            NavItem('applications', 'Applications', Icons.description_outlined),
            NavItem('allottees', 'Allottees', Icons.groups_2_outlined),
            NavItem('evictions', 'Evictions', Icons.gavel_outlined),
          ]),
          NavGroup('Finance', [
            NavItem('rent', 'Rent Collection', Icons.payments_outlined),
            NavItem('utilities', 'Utility Bills', Icons.bolt_outlined),
          ]),
          NavGroup('Operations', [
            NavItem('complaints', 'Complaints', Icons.support_agent_outlined),
            NavItem('staff', 'Staff', Icons.badge_outlined),
          ]),
          NavGroup('System', [
            NavItem('notifications', 'Notifications', Icons.notifications_outlined),
          ]),
        ];
    }
  }

  /// First screen a role lands on after login (mirrors `defaultScreenForRole`).
  static String defaultScreen(String role) {
    switch (role) {
      case AppRoles.superAdmin:
      case AppRoles.admin:
        return 'director';
      case AppRoles.industryAdmin:
        return 'newApplication';
      case AppRoles.colonySection:
        return 'verificationDesk';
      case AppRoles.secretaryKpWwb:
      case AppRoles.chairmanKpWwb:
        return 'committeeDesk';
      case AppRoles.worksWing:
        return 'assetsSetup';
      case AppRoles.careTakerLabourColony:
        return 'caretakerDuty';
      case AppRoles.legalSection:
        return 'evictions';
      case AppRoles.financeWing:
        return 'accounts';
      case AppRoles.recoveriesRent:
        return 'rent';
      case AppRoles.deputyDirectorGahr:
        return 'staff';
      default:
        return 'director';
    }
  }
}
