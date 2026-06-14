// Canonical backend role identifiers. Must match the `user_role` enum in the
// Prisma schema (prisma/schema.prisma) and the frontend / Flutter role lists.
export const ROLES = {
  admin: 'admin',
  superAdmin: 'super_admin',
  adColoniesZone1: 'ad_colonies_zone1',
  adColoniesZone2: 'ad_colonies_zone2',
  worksWing: 'works_wing',
  financeWing: 'finance_wing',
  recoveriesRent: 'recoveries_rent',
  careTakerLabourColony: 'care_taker_labour_colony',
  colonySection: 'colony_section',
  legalSection: 'legal_section',
  deputyDirectorGahr: 'deputy_director_gahr',
  directorAdmin: 'director_admin',
  secretaryKpWwb: 'secretary_kp_wwb',
  chairmanKpWwb: 'chairman_kp_wwb',
  industryAdmin: 'industry_admin',
} as const;

// Roles that bypass every permission check and can edit any record anywhere.
export const PRIVILEGED_ROLES: readonly string[] = [ROLES.superAdmin, ROLES.admin];

// The two Assistant Director (Colonies) roles control all colonies in their zone.
export const AD_COLONIES_ROLES: readonly string[] = [ROLES.adColoniesZone1, ROLES.adColoniesZone2];

/**
 * Returns true when `role` is allowed. `super_admin` and `admin` always pass —
 * they have full access across the whole application.
 */
export function canAccess(role: string | undefined, ...allowed: string[]): boolean {
  if (!role) return false;
  if (PRIVILEGED_ROLES.includes(role)) return true;
  return allowed.includes(role);
}

export function isPrivileged(role: string | undefined): boolean {
  return !!role && PRIVILEGED_ROLES.includes(role);
}
