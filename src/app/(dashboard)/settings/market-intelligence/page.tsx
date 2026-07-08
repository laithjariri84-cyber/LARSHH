import { redirect } from "next/navigation";

import { isMarketIntelligenceAdmin } from "@/lib/market-intelligence-admin-auth";

export const dynamic = "force-dynamic";

export default async function LegacyMarketIntelligenceAdminRedirect() {
  const allowed = await isMarketIntelligenceAdmin();
  if (!allowed) {
    redirect("/dashboard");
  }

  redirect("/admin/market-intelligence");
}
