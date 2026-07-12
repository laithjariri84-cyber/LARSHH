import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CommunityIntelligenceView } from "@/features/communities/components/community-intelligence-view";
import { getProjectBySlugs } from "@/features/communities/lib/community-registry";
import { getCommunityMarketSummaryByName } from "@/server/market-intelligence";

type CommunityIntelligencePageProps = {
  params: Promise<{
    masterSlug: string;
    projectSlug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CommunityIntelligencePageProps): Promise<Metadata> {
  const { masterSlug, projectSlug } = await params;
  const match = getProjectBySlugs(masterSlug, projectSlug);

  if (!match) {
    return { title: "Community Intelligence" };
  }

  return {
    title: `${match.project.name} · Community Intelligence`,
  };
}

export default async function CommunityIntelligencePage({
  params,
}: CommunityIntelligencePageProps) {
  const { masterSlug, projectSlug } = await params;
  const match = getProjectBySlugs(masterSlug, projectSlug);

  if (!match) {
    notFound();
  }

  const marketSummary = await getCommunityMarketSummaryByName(match.project.name);

  return (
    <CommunityIntelligenceView
      master={match.master}
      project={match.project}
      marketSummary={marketSummary}
    />
  );
}
