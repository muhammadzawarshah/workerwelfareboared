/// Canonical backend roles (must match the `user_role` enum in the backend
/// Prisma schema and the web frontend's config/roles.ts).
/// `super_admin` and `admin` are system roles and are NOT surfaced in the mobile app.
class AppRoles {
  const AppRoles._();

  static const admin = 'admin';
  static const superAdmin = 'super_admin';
  static const adColoniesZone1 = 'ad_colonies_zone1';
  static const adColoniesZone2 = 'ad_colonies_zone2';
  static const worksWing = 'works_wing';
  static const financeWing = 'finance_wing';
  static const recoveriesRent = 'recoveries_rent';
  static const careTakerLabourColony = 'care_taker_labour_colony';
  static const colonySection = 'colony_section';
  static const legalSection = 'legal_section';
  static const deputyDirectorGahr = 'deputy_director_gahr';
  static const directorAdmin = 'director_admin';
  static const secretaryKpWwb = 'secretary_kp_wwb';
  static const chairmanKpWwb = 'chairman_kp_wwb';
  static const industryAdmin = 'industry_admin';

  /// Roles the mobile app builds dashboards for (system roles excluded).
  static const supported = <String>[
    directorAdmin,
    adColoniesZone1,
    adColoniesZone2,
    colonySection,
    secretaryKpWwb,
    chairmanKpWwb,
    careTakerLabourColony,
    worksWing,
    financeWing,
    recoveriesRent,
    legalSection,
    deputyDirectorGahr,
    industryAdmin,
  ];

  static bool isSupported(String role) => supported.contains(role);

  /// Friendly display label for a role.
  static String label(String role) {
    switch (role) {
      case admin:
        return 'Admin';
      case superAdmin:
        return 'Super Admin';
      case adColoniesZone1:
        return 'AD Colonies — Zone 1';
      case adColoniesZone2:
        return 'AD Colonies — Zone 2';
      case worksWing:
        return 'Works Wing';
      case financeWing:
        return 'Finance Wing';
      case recoveriesRent:
        return 'Recoveries / Rent';
      case careTakerLabourColony:
        return 'Caretaker (Labour Colony)';
      case colonySection:
        return 'Colony Section';
      case legalSection:
        return 'Legal Section';
      case deputyDirectorGahr:
        return 'Deputy Director (GAHR)';
      case directorAdmin:
        return 'Director Admin';
      case secretaryKpWwb:
        return 'Secretary KP WWB';
      case chairmanKpWwb:
        return 'Chairman KP WWB';
      case industryAdmin:
        return 'Industry Portal';
      default:
        return role;
    }
  }
}
