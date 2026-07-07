import type { Metadata } from "next";

import { MarketIntelligenceExperience } from "@/features/market-intelligence/components/market-intelligence-experience";
import { listCommunityMarketSummaries } from "@/server/market-intelligence";
import { logRscError, rscTry } from "@/lib/rsc-debug";

export const metadata: Metadata = {
  title: "Market Intelligence",
  description:
    "Community pricing benchmarks from the LARSSH Market Intelligence database.",
};

/** Data is cached via unstable_cache; page stays dynamic to avoid build-time DB dependency. */
export const dynamic = "force-dynamic";

export default async function MarketPage() {
  try {
    const summaries = await rscTry("market/page:listCommunityMarketSummaries", () =>
      listCommunityMarketSummaries()
    );

    return <MarketIntelligenceExperience summaries={summaries} />;
  } catch (error) {
    logRscError("market/page:render", error);
  }
}
