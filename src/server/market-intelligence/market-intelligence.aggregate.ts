import {
  buildCommunityMarketSummary,
  formatRentRange,
  type CommunityMarketSummary,
} from "@/lib/market-intelligence/summary";
import { resolveCommunitySlug } from "@/server/market-intelligence/community-matcher";
import type { CommunityMarketProfileRecord } from "@/server/market-intelligence/market-intelligence.types";
import {
  listMarketProfiles,
  listMarketProfilesByCommunitySlug,
} from "@/server/market-intelligence/market-intelligence.repository";

export type { CommunityMarketSummary } from "@/lib/market-intelligence/summary";
export { buildCommunityMarketSummary, formatRentRange };

function emptySummary(
  communitySlug: string,
  communityName: string
): CommunityMarketSummary {
  return {
    communitySlug,
    communityName,
    available: false,
    averageSalePrice: null,
    lowestSalePrice: null,
    highestSalePrice: null,
    averageRent: null,
    furnishedRentMin: null,
    furnishedRentMax: null,
    unfurnishedRentMin: null,
    unfurnishedRentMax: null,
    roi: null,
    pricePerSqft: null,
    demand: null,
    confidence: null,
    isEstimated: false,
    profiles: [],
  };
}

function groupProfilesBySlug(
  profiles: CommunityMarketProfileRecord[]
): Map<string, CommunityMarketProfileRecord[]> {
  const grouped = new Map<string, CommunityMarketProfileRecord[]>();
  for (const profile of profiles) {
    const rows = grouped.get(profile.communitySlug) ?? [];
    rows.push(profile);
    grouped.set(profile.communitySlug, rows);
  }
  return grouped;
}

/** One summary per research community slug — sourced only from CommunityMarketIntelligence. */
export async function listCommunityMarketSummaries(): Promise<
  CommunityMarketSummary[]
> {
  try {
    const researchProfiles = await listMarketProfiles();
    const groupedProfiles = groupProfilesBySlug(researchProfiles);
    const summaries: CommunityMarketSummary[] = [];

    for (const [researchSlug, profiles] of groupedProfiles) {
      const name = profiles[0]?.communityName ?? researchSlug;
      summaries.push(buildCommunityMarketSummary(researchSlug, name, profiles));
    }

    return summaries.sort((a, b) =>
      a.communityName.localeCompare(b.communityName)
    );
  } catch (error) {
    console.error("[market-intelligence] listCommunityMarketSummaries:", error);
    return [];
  }
}

export async function getCommunityMarketSummary(
  communitySlug: string,
  bedroomCount?: number
): Promise<CommunityMarketSummary | null> {
  try {
    const communityProfiles =
      await listMarketProfilesByCommunitySlug(communitySlug);

    if (communityProfiles.length === 0) {
      return null;
    }

    const scopedProfiles =
      bedroomCount === undefined
        ? communityProfiles
        : communityProfiles.filter(
            (profile) => profile.bedroomCount === bedroomCount
          );

    if (scopedProfiles.length === 0) {
      return null;
    }

    return buildCommunityMarketSummary(
      communitySlug,
      scopedProfiles[0]?.communityName ?? communitySlug,
      scopedProfiles
    );
  } catch (error) {
    console.error("[market-intelligence] getCommunityMarketSummary:", error);
    return null;
  }
}

export async function getCommunityMarketSummaryByName(
  communityName: string,
  bedroomCount?: number
): Promise<CommunityMarketSummary | null> {
  try {
    const canonicalSlug =
      resolveCommunitySlug(communityName) ??
      communityName.toLowerCase().replace(/\s+/g, "-");

    const summary = await getCommunityMarketSummary(canonicalSlug, bedroomCount);
    if (summary) {
      return summary;
    }

    return emptySummary(canonicalSlug, communityName);
  } catch (error) {
    console.error("[market-intelligence] getCommunityMarketSummaryByName:", error);
    return emptySummary(
      communityName.toLowerCase().replace(/\s+/g, "-"),
      communityName
    );
  }
}
