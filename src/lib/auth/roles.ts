import type { UserRole as PrismaUserRole } from "@prisma/client";

/** Application roles used for navigation and permission checks. */
export type AppRole = "FOUNDER" | "ADMIN" | "AGENT" | "MEMBER";

export const FOUNDER_EMAIL = "laithjariri84@gmail.com";
export const AGENT_EMAIL = "alliath.musa@paragonrak.com";
export const FOUNDER_DISPLAY_NAME = "MR. LAITH";

const FOUNDER_EMAILS = new Set([FOUNDER_EMAIL.toLowerCase()]);
const AGENT_EMAILS = new Set([AGENT_EMAIL.toLowerCase()]);

export const ROLE_DISPLAY_TITLES: Record<AppRole, string> = {
  FOUNDER: "CEO & Founder",
  ADMIN: "Administrator",
  AGENT: "Real Estate Advisor",
  MEMBER: "Member",
};

export function normalizeEmail(email: string | null | undefined): string {
  return email?.trim().toLowerCase() ?? "";
}

export function resolveAppRole(
  email: string | null | undefined,
  dbRoles: PrismaUserRole[] = []
): AppRole {
  const normalized = normalizeEmail(email);

  if (FOUNDER_EMAILS.has(normalized)) {
    return "FOUNDER";
  }

  if (AGENT_EMAILS.has(normalized)) {
    return "AGENT";
  }

  if (dbRoles.includes("FOUNDER")) {
    return "FOUNDER";
  }

  if (dbRoles.includes("ADMIN")) {
    return "ADMIN";
  }

  if (dbRoles.includes("MANAGER")) {
    return "ADMIN";
  }

  if (dbRoles.includes("AGENT")) {
    return "AGENT";
  }

  if (dbRoles.includes("MEMBER")) {
    return "MEMBER";
  }

  return "MEMBER";
}

export function getRoleDisplayTitle(role: AppRole): string {
  return ROLE_DISPLAY_TITLES[role];
}

export function getAccountDisplayName(
  email: string,
  _role: AppRole,
  metadataFullName?: string | null
): string {
  if (normalizeEmail(email) === FOUNDER_EMAIL) {
    return FOUNDER_DISPLAY_NAME;
  }

  if (typeof metadataFullName === "string" && metadataFullName.trim()) {
    return metadataFullName.trim();
  }

  const localPart = email.split("@")[0]?.trim();
  return localPart || "User";
}

export function isFounderRole(role: AppRole): boolean {
  return role === "FOUNDER";
}

export function isAgentRole(role: AppRole): boolean {
  return role === "AGENT";
}

export type AuthContext = {
  userId: string;
  email: string;
  appRole: AppRole;
  displayTitle: string;
  agentId: string | null;
};
