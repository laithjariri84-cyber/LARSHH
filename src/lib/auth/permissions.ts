import type { AppRole } from "./roles";

export type Permission =
  | "access.dashboard"
  | "access.search"
  | "access.crm"
  | "access.market.read"
  | "access.intelligence"
  | "access.import"
  | "access.communities"
  | "access.favorites"
  | "access.admin"
  | "access.market_intelligence.cms"
  | "access.settings"
  | "access.users"
  | "access.analytics";

const FOUNDER_PERMISSIONS = new Set<Permission>([
  "access.dashboard",
  "access.search",
  "access.crm",
  "access.market.read",
  "access.intelligence",
  "access.import",
  "access.communities",
  "access.favorites",
  "access.admin",
  "access.market_intelligence.cms",
  "access.settings",
  "access.users",
  "access.analytics",
]);

const ADMIN_PERMISSIONS = new Set<Permission>([
  "access.dashboard",
  "access.search",
  "access.crm",
  "access.market.read",
  "access.intelligence",
  "access.import",
  "access.communities",
  "access.favorites",
  "access.admin",
  "access.settings",
  "access.users",
  "access.analytics",
]);

const AGENT_PERMISSIONS = new Set<Permission>([
  "access.dashboard",
  "access.search",
  "access.crm",
  "access.market.read",
  "access.communities",
  "access.settings",
]);

const MEMBER_PERMISSIONS = new Set<Permission>([
  "access.dashboard",
  "access.search",
  "access.market.read",
  "access.communities",
  "access.favorites",
]);

const PERMISSIONS_BY_ROLE: Record<AppRole, Set<Permission>> = {
  FOUNDER: FOUNDER_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  AGENT: AGENT_PERMISSIONS,
  MEMBER: MEMBER_PERMISSIONS,
};

export function hasPermission(role: AppRole, permission: Permission): boolean {
  return PERMISSIONS_BY_ROLE[role].has(permission);
}

export function canManageMarketIntelligenceCms(role: AppRole): boolean {
  return hasPermission(role, "access.market_intelligence.cms");
}

export function canAccessAdminNav(role: AppRole): boolean {
  return hasPermission(role, "access.admin");
}

export function shouldScopeDashboardToAgent(role: AppRole): boolean {
  return role === "AGENT";
}

/** Founder dashboard is administration-only — no owned listings. */
export function shouldExcludeListingsFromDashboard(role: AppRole): boolean {
  return role === "FOUNDER";
}

/** Human-readable permission matrix for documentation. */
export const PERMISSION_MATRIX: Record<
  AppRole,
  { allowed: string[]; denied: string[] }
> = {
  FOUNDER: {
    allowed: [
      "Dashboard (no owned listings — admin view)",
      "Admin",
      "Market Intelligence CMS (create/edit/delete/save)",
      "User Management",
      "Community Management",
      "System Settings",
      "Analytics",
      "CRM",
      "All modules",
    ],
    denied: [],
  },
  ADMIN: {
    allowed: [
      "Dashboard",
      "Search",
      "CRM",
      "Market (read)",
      "Import",
      "Communities",
      "Settings",
      "Users/Agents",
      "Analytics",
    ],
    denied: ["Market Intelligence CMS"],
  },
  AGENT: {
    allowed: [
      "Dashboard (own listings)",
      "Search",
      "CRM",
      "Properties / Communities",
      "Market (read only)",
      "Settings",
    ],
    denied: [
      "Admin",
      "Market Intelligence CMS",
      "Users",
      "Import",
      "Property Intelligence terminal",
    ],
  },
  MEMBER: {
    allowed: ["Dashboard", "Search", "Market (read)", "Communities"],
    denied: ["Admin", "CRM", "CMS", "Settings", "Users"],
  },
};
