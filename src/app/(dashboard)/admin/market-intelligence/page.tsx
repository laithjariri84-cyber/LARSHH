import { MarketIntelligenceCmsPanel } from "@/features/market-intelligence-admin/components/market-intelligence-cms-panel";
import { isMarketIntelligenceAdmin } from "@/lib/market-intelligence-admin-auth";

export const metadata = {
  title: "Market Intelligence",
};

export const dynamic = "force-dynamic";

export default async function AdminMarketIntelligencePage() {
  const allowed = await isMarketIntelligenceAdmin();
  if (!allowed) {
    return (
      <div className="larssh-page flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="larssh-card max-w-lg rounded-2xl p-8">
          <p className="text-gold text-sm font-medium tracking-wide uppercase">
            403 Unauthorized
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Access denied
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            You do not have permission to manage market intelligence in LARSSH.
          </p>
        </div>
      </div>
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
          Manage community intelligence profiles for LARSSH. All currency values
          are stored and displayed in AED. Changes propagate across property
          details, community pages, and market analytics.
        </p>
      </div>

      <MarketIntelligenceCmsPanel />
    </div>
  );
}
