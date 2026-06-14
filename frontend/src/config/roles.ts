// Canonical frontend role identifiers. Must match the backend `user_role` enum
// (backend/prisma/schema.prisma) and the Flutter AppRoles list.

export const ROLES = {
  admin: "admin",
  superAdmin: "super_admin",
  adColoniesZone1: "ad_colonies_zone1",
  adColoniesZone2: "ad_colonies_zone2",
  worksWing: "works_wing",
  financeWing: "finance_wing",
  recoveriesRent: "recoveries_rent",
  careTakerLabourColony: "care_taker_labour_colony",
  colonySection: "colony_section",
  legalSection: "legal_section",
  deputyDirectorGahr: "deputy_director_gahr",
  directorAdmin: "director_admin",
  secretaryKpWwb: "secretary_kp_wwb",
  chairmanKpWwb: "chairman_kp_wwb",
  industryAdmin: "industry_admin",
} as const;

export type RoleId = (typeof ROLES)[keyof typeof ROLES];

// Full list, used for selectable role dropdowns (e.g. the Users screen).
export const ALL_ROLES: string[] = Object.values(ROLES);

// Roles with full access to every screen and record (the "super admin can change
// anything" requirement). director_admin is included as top oversight.
export const PRIVILEGED_ROLES: string[] = [ROLES.superAdmin, ROLES.admin];

// Management-level roles that see the full default navigation.
export const MANAGEMENT_ROLES: string[] = [ROLES.superAdmin, ROLES.admin, ROLES.directorAdmin];

export const AD_COLONIES_ROLES: string[] = [ROLES.adColoniesZone1, ROLES.adColoniesZone2];

export function isPrivileged(role?: string): boolean {
  return !!role && PRIVILEGED_ROLES.includes(role);
}

export function isManagement(role?: string): boolean {
  return !!role && MANAGEMENT_ROLES.includes(role);
}

export const ROLE_LABELS: Record<string, string> = {
  [ROLES.admin]: "Admin",
  [ROLES.superAdmin]: "Super Admin",
  [ROLES.adColoniesZone1]: "Assistant Director (Colonies) — Zone 1",
  [ROLES.adColoniesZone2]: "Assistant Director (Colonies) — Zone 2",
  [ROLES.worksWing]: "Works Wing",
  [ROLES.financeWing]: "Finance Wing",
  [ROLES.recoveriesRent]: "Recoveries / Rent",
  [ROLES.careTakerLabourColony]: "Caretaker (Labour Colony)",
  [ROLES.colonySection]: "Colony Section",
  [ROLES.legalSection]: "Legal Section",
  [ROLES.deputyDirectorGahr]: "Deputy Director (GAHR)",
  [ROLES.directorAdmin]: "Director Admin",
  [ROLES.secretaryKpWwb]: "Secretary KP WWB",
  [ROLES.chairmanKpWwb]: "Chairman KP WWB",
  [ROLES.industryAdmin]: "Industry Portal",
};

export function roleLabel(role?: string): string {
  return (role && ROLE_LABELS[role]) || role || "";
}
