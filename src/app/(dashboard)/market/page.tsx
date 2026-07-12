import type { Metadata } from "next";

import { MarketIntelligenceExperience } from "@/features/market-intelligence/components/market-intelligence-experience";
import { listCommunityMarketSummaries } from "@/server/market-intelligence";

export const metadata: Metadata = {
  title: "Market Intelligence",
  description:
    "Community pricing benchmarks from the LARSSH Market Intelligence database.",
};

/** Data is cached via unstable_cache; page stays dynamic to avoid build-time DB dependency. */
export const dynamic = "force-dynamic";

export default async function MarketPage() {
  let summaries: Awaited<ReturnType<typeof listCommunityMarketSummaries>> = [];

  try {
    summaries = await listCommunityMarketSummaries();
  } catch (error) {
    console.error("[market] page load failed:", error);
  }

  return <MarketIntelligenceExperience summaries={summaries} />;
}
