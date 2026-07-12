import { MarketIntelligenceAdminPanel } from "@/features/market-intelligence-admin/components/market-intelligence-admin-panel";
import { ForbiddenPanel } from "@/components/auth/forbidden-panel";
import { isFounder } from "@/lib/auth/session";

export const metadata = {
  title: "Market Intelligence",
};

export const dynamic = "force-dynamic";

export default async function AdminMarketIntelligencePage() {
  const allowed = await isFounder();
  if (!allowed) {
    return (
      <ForbiddenPanel message="Only the Founder can manage Market Intelligence profiles." />
    );
  }

  return (
    <div className="larssh-page space-y-6">
      <div>
        <p className="text-gold text-sm font-medium tracking-wide uppercase">
          Admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          Market Intelligence
        </h1>
        <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
          Edit community market intelligence profiles directly. All currency values
          are stored and displayed in AED. Saved changes appear immediately on the
          public Market Intelligence page.
        </p>
      </div>

      <MarketIntelligenceAdminPanel />
    </div>
  );
}
