import { ROLES, MANAGEMENT_ROLES, AD_COLONIES_ROLES } from "@/src/config/roles";

export type NavKey =
  | "director"
  | "applications"
  | "newApplication"
  | "verificationDesk"
  | "committeeDesk"
  | "allottees"
  | "industries"
  | "colonies"
  | "units"
  | "flatAssignments"
  | "evictions"
  | "documents"
  | "documentTypes"
  | "rent"
  | "accounts"
  | "rentRates"
  | "lateFeeRules"
  | "rentPayments"
  | "utilities"
  | "utilityConnections"
  | "utilityPayments"
  | "complaints"
  | "complaintBudgets"
  | "maintenance"
  | "assets"
  | "assetsSetup"
  | "caretakerDuty"
  | "caretakerAttendance"
  | "caretakerGps"
  | "taskProofs"
  | "staff"
  | "notifications"
  | "auditLogs"
  | "reports"
  | "settings";

export type NavGroup = {
  label: string;
  items: { key: NavKey; label: string }[];
};

/** Default (director / superadmin) navigation. */
export const navGroups: NavGroup[] = [
  {
    label: "Colony Section",
    items: [
      { key: "director", label: "Dashboard" },
      { key: "applications", label: "Applications" },
      { key: "allottees", label: "Allottees Data" },
      { key: "industries", label: "Industries" },
      { key: "colonies", label: "Colonies" },
      { key: "units", label: "Unit Status" },
      { key: "flatAssignments", label: "Flat Assignments" },
      { key: "evictions", label: "Evictions" },
      { key: "documents", label: "Documents" },
      { key: "documentTypes", label: "Document Types" },
    ],
  },
  {
    label: "Finance",
    items: [
      { key: "rent", label: "Rent Collection" },
      { key: "rentRates", label: "Rent Rates" },
      { key: "lateFeeRules", label: "Late Fee Rules" },
      { key: "rentPayments", label: "Rent Payments" },
      { key: "utilities", label: "Utility Bills" },
      { key: "utilityConnections", label: "Utility Connections" },
      { key: "utilityPayments", label: "Utility Payments" },
    ],
  },
  {
    label: "Operations",
    items: [
      { key: "complaints", label: "Complaints" },
      { key: "complaintBudgets", label: "Complaint Budgets" },
      { key: "maintenance", label: "Maintenance" },
      { key: "assets", label: "Assets" },
      { key: "caretakerDuty", label: "Caretaker Duty" },
      { key: "caretakerAttendance", label: "Attendance Logs" },
      { key: "caretakerGps", label: "GPS Tracking" },
      { key: "taskProofs", label: "Task Proofs" },
      { key: "staff", label: "Staff" },
      { key: "reports", label: "Reports" },
    ],
  },
  {
    label: "System",
    items: [
      { key: "notifications", label: "Notifications" },
      { key: "auditLogs", label: "Audit Logs" },
      { key: "settings", label: "Settings" },
    ],
  },
];

/** Resolve the navigation groups visible to a given role. */
export function navGroupsForRole(role?: string): NavGroup[] {
  // Super Admin / Admin / Director Admin see everything.
  if (MANAGEMENT_ROLES.includes(role ?? "")) return navGroups;

  if (role === ROLES.industryAdmin) {
    return [
      {
        label: "Industry Portal",
        items: [
          { key: "newApplication", label: "Apply / Allotment" },
          { key: "applications", label: "Applications" },
          { key: "allottees", label: "My Workers" },
        ],
      },
      {
        label: "Updates",
        items: [{ key: "notifications", label: "Notifications" }],
      },
    ];
  }
  // Assistant Directors (Colonies) oversee all colonies in their zone.
  if (AD_COLONIES_ROLES.includes(role ?? "")) {
    return [
      {
        label: "Colonies (Zone)",
        items: [
          { key: "director", label: "Dashboard" },
          { key: "applications", label: "Applications" },
          { key: "allottees", label: "Allottees Data" },
          { key: "colonies", label: "Colonies" },
          { key: "units", label: "Unit Status" },
          { key: "flatAssignments", label: "Allotment Desk" },
          { key: "evictions", label: "Evictions" },
          { key: "complaints", label: "Complaints" },
          { key: "notifications", label: "Notifications" },
        ],
      },
    ];
  }
  if (role === ROLES.colonySection) {
    return [
      {
        label: "Colony Section",
        items: [
          { key: "applications", label: "Applications" },
          { key: "verificationDesk", label: "Workers Verification" },
          { key: "allottees", label: "Allottees Data" },
          { key: "colonies", label: "Colonies" },
          { key: "units", label: "Unit Status" },
          { key: "documents", label: "Documents" },
          { key: "documentTypes", label: "Document Types" },
          { key: "industries", label: "Industries" },
          { key: "notifications", label: "Notifications" },
        ],
      },
    ];
  }
  if (role === ROLES.secretaryKpWwb || role === ROLES.chairmanKpWwb) {
    return [
      {
        label: "Committee",
        items: [
          { key: "committeeDesk", label: "Committee Desk" },
          { key: "applications", label: "Applications" },
          { key: "flatAssignments", label: "Flat Assignments" },
          { key: "reports", label: "Reports" },
          { key: "notifications", label: "Notifications" },
        ],
      },
    ];
  }
  // Caretaker is the on-ground colony admin (legacy colony_admin + caretaker merged).
  if (role === ROLES.careTakerLabourColony) {
    return [
      {
        label: "Caretaker",
        items: [
          { key: "caretakerDuty", label: "Caretaker Duty" },
          { key: "applications", label: "Applications" },
          { key: "complaints", label: "Complaints" },
          { key: "rent", label: "Rent Collection" },
          { key: "units", label: "Unit Status" },
          { key: "caretakerAttendance", label: "Attendance Logs" },
          { key: "caretakerGps", label: "GPS Tracking" },
          { key: "notifications", label: "Notifications" },
        ],
      },
    ];
  }
  if (role === ROLES.worksWing) {
    return [
      {
        label: "Works Wing",
        items: [
          { key: "assetsSetup", label: "Assets Dashboard" },
          { key: "colonies", label: "Colonies" },
          { key: "units", label: "Flats" },
          { key: "assets", label: "Colony Assets" },
          { key: "maintenance", label: "Maintenance" },
          { key: "complaints", label: "Complaints" },
          { key: "notifications", label: "Notifications" },
        ],
      },
    ];
  }
  if (role === ROLES.legalSection) {
    return [
      {
        label: "Legal Section",
        items: [
          { key: "evictions", label: "Illegal Occupants" },
          { key: "auditLogs", label: "Audit Logs" },
          { key: "notifications", label: "Notifications" },
        ],
      },
    ];
  }
  if (role === ROLES.deputyDirectorGahr) {
    return [
      {
        label: "General Admin & HR",
        items: [
          { key: "staff", label: "Staff" },
          { key: "settings", label: "Users & Settings" },
          { key: "auditLogs", label: "Audit Logs" },
          { key: "reports", label: "Reports" },
          { key: "notifications", label: "Notifications" },
        ],
      },
    ];
  }
  if (role === ROLES.financeWing) {
    return [
      {
        label: "Finance Wing",
        items: [
          { key: "accounts", label: "Accounts Dashboard" },
          { key: "rent", label: "Rent Collection" },
          { key: "rentRates", label: "Rent Rates" },
          { key: "rentPayments", label: "Rent Payments" },
          { key: "utilities", label: "Utility Bills" },
          { key: "utilityConnections", label: "Utility Connections" },
          { key: "utilityPayments", label: "Utility Payments" },
          { key: "lateFeeRules", label: "Late Fee Rules" },
          { key: "notifications", label: "Notifications" },
        ],
      },
    ];
  }
  if (role === ROLES.recoveriesRent) {
    return [
      {
        label: "Recoveries / Rent",
        items: [
          { key: "rent", label: "Rent Collection" },
          { key: "rentPayments", label: "Rent Payments" },
          { key: "lateFeeRules", label: "Late Fee Rules" },
          { key: "reports", label: "Reports" },
          { key: "notifications", label: "Notifications" },
        ],
      },
    ];
  }
  return navGroups;
}

/** Whether a navigation key is reachable for the given role. */
export function isNavAllowed(role: string | undefined, key: NavKey) {
  return navGroupsForRole(role).some((group) => group.items.some((item) => item.key === key));
}

/** Landing screen for each role after login. */
export function defaultScreenForRole(role?: string): NavKey {
  if (role === ROLES.industryAdmin) return "newApplication";
  if (role === ROLES.colonySection) return "applications";
  if (AD_COLONIES_ROLES.includes(role ?? "")) return "director";
  if (role === ROLES.secretaryKpWwb || role === ROLES.chairmanKpWwb) return "committeeDesk";
  if (role === ROLES.worksWing) return "assetsSetup";
  if (role === ROLES.careTakerLabourColony) return "caretakerDuty";
  if (role === ROLES.legalSection) return "evictions";
  if (role === ROLES.financeWing) return "accounts";
  if (role === ROLES.recoveriesRent) return "rent";
  if (role === ROLES.deputyDirectorGahr) return "staff";
  return "director";
}
