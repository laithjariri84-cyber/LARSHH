import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CommunityIntelligenceView } from "@/features/communities/components/community-intelligence-view";
import {
  getAllProjectRoutes,
  getProjectBySlugs,
} from "@/features/communities/lib/community-registry";
import { getCommunityMarketSummaryByName } from "@/server/market-intelligence";
import { logRscError, rscTry } from "@/lib/rsc-debug";

type CommunityIntelligencePageProps = {
  params: Promise<{
    masterSlug: string;
    projectSlug: string;
  }>;
};

export async function generateStaticParams() {
  return getAllProjectRoutes();
}

export async function generateMetadata({
  params,
}: CommunityIntelligencePageProps): Promise<Metadata> {
  try {
    const { masterSlug, projectSlug } = await params;
    const match = getProjectBySlugs(masterSlug, projectSlug);

    if (!match) {
      return { title: "Community Intelligence" };
    }

    return {
      title: `${match.project.name} · Community Intelligence`,
    };
  } catch (error) {
    logRscError("communities/[masterSlug]/[projectSlug]/generateMetadata", error);
  }
}

export default async function CommunityIntelligencePage({
  params,
}: CommunityIntelligencePageProps) {
  try {
    const { masterSlug, projectSlug } = await params;
    const match = getProjectBySlugs(masterSlug, projectSlug);

    if (!match) {
      notFound();
    }

    const marketSummary = await rscTry(
      "communities/[masterSlug]/[projectSlug]/page:getCommunityMarketSummaryByName",
      () => getCommunityMarketSummaryByName(match.project.name)
    );

    return (
      <CommunityIntelligenceView
        master={match.master}
        project={match.project}
        marketSummary={marketSummary}
      />
    );
  } catch (error) {
    logRscError("communities/[masterSlug]/[projectSlug]/page:render", error);
  }
}
