import { getUser } from "@/lib/auth";
import { requireFounder, isFounder } from "@/lib/auth/session";

/** @deprecated Use isFounder() from @/lib/auth/session */
export const MARKET_INTELLIGENCE_ADMIN_EMAIL = "laithjariri84@gmail.com";

/** @deprecated Use isFounder() */
export function isMarketIntelligenceAdminEmail(
  email: string | null | undefined
): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === MARKET_INTELLIGENCE_ADMIN_EMAIL;
}

/** Founder-only access for Market Intelligence CMS. */
export async function isMarketIntelligenceAdmin(): Promise<boolean> {
  return isFounder();
}

/** Founder-only access for Market Intelligence CMS mutations. */
export async function requireMarketIntelligenceAdmin() {
  await requireFounder();
  const user = await getUser();
  if (!user) {
    const error = new Error("Unauthorized");
    (error as Error & { status: number }).status = 401;
    throw error;
  }
  return user;
}
