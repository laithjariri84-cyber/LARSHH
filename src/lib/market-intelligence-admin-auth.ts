import { getUser } from "@/lib/auth";

export const MARKET_INTELLIGENCE_ADMIN_EMAIL = "alliath.musa@paragonrak.com";

export function isMarketIntelligenceAdminEmail(
  email: string | null | undefined
): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === MARKET_INTELLIGENCE_ADMIN_EMAIL;
}

export async function isMarketIntelligenceAdmin(): Promise<boolean> {
  const user = await getUser();
  return isMarketIntelligenceAdminEmail(user?.email);
}

export async function requireMarketIntelligenceAdmin() {
  const user = await getUser();
  if (!user || !isMarketIntelligenceAdminEmail(user.email)) {
    const error = new Error("Forbidden");
    (error as Error & { status: number }).status = 403;
    throw error;
  }
  return user;
}
