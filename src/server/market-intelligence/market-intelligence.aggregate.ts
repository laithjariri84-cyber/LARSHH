import {
  findCommunityIdByName,
  getCommunityIntelligenceCmsByCommunityId,
} from "./cms";
import {
  buildCommunityMarketSummary,
  formatRentRange,
  type CommunityMarketSummary,
} from "@/lib/market-intelligence/summary";
import { resolveCommunitySlug } from "@/server/market-intelligence/community-matcher";
import {
  listMarketProfiles,
  listMarketProfilesByCommunitySlug,
} from "@/server/market-intelligence/market-intelligence.repository";

export type { CommunityMarketSummary } from "@/lib/market-intelligence/summary";
export { buildCommunityMarketSummary, formatRentRange };

export async function getCommunityMarketSummary(
  communitySlug: string,
  bedroomCount?: number
): Promise<CommunityMarketSummary | null> {
  const communityProfiles = await listMarketProfilesByCommunitySlug(communitySlug);

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
}

export async function listCommunityMarketSummaries(): Promise<
  CommunityMarketSummary[]
> {
  const profiles = await listMarketProfiles();
  const grouped = new Map<string, typeof profiles>();

  for (const profile of profiles) {
    const rows = grouped.get(profile.communitySlug) ?? [];
    rows.push(profile);
    grouped.set(profile.communitySlug, rows);
  }

  return Array.from(grouped.entries())
    .map(([slug, rows]) =>
      buildCommunityMarketSummary(slug, rows[0]?.communityName ?? slug, rows)
    )
    .sort((a, b) => a.communityName.localeCompare(b.communityName));
}

export async function getCommunityMarketSummaryByName(
  communityName: string,
  bedroomCount?: number
): Promise<CommunityMarketSummary | null> {
  const slug = resolveCommunitySlug(communityName);
  if (!slug) return null;

  const summary = await getCommunityMarketSummary(slug, bedroomCount);
  const communityId = await findCommunityIdByName(communityName);
  if (!communityId) return summary;

  const cms = await getCommunityIntelligenceCmsByCommunityId(communityId);
  if (!cms) return summary;

  return {
    ...(summary ?? {
      communitySlug: slug,
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
    }),
    available: true,
    communityName: cms.communityName,
    averageSalePrice: cms.averageSalePriceAed ?? summary?.averageSalePrice ?? null,
    averageRent: cms.averageRentAedYear ?? summary?.averageRent ?? null,
    pricePerSqft: cms.averagePricePerSqftAed ?? summary?.pricePerSqft ?? null,
    roi: cms.averageRoiPercent ?? summary?.roi ?? null,
    demand: cms.rentalDemand ?? summary?.demand ?? null,
  };
}
