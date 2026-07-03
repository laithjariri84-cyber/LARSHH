import type { Metadata } from "next";

import { MarketIntelligenceExperience } from "@/features/market-intelligence/components/market-intelligence-experience";
import { listCommunityMarketSummaries } from "@/server/market-intelligence";

export const metadata: Metadata = {
  title: "Market Intelligence",
  description:
    "Community pricing benchmarks from the LARSSH Market Intelligence database.",
};

export const dynamic = "force-dynamic";

export default async function MarketPage() {
  const summaries = await listCommunityMarketSummaries();

  return <MarketIntelligenceExperience summaries={summaries} />;
}
