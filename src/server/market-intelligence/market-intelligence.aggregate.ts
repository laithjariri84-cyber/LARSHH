import {
  findCommunityIdByName,
  getCommunityIntelligenceCmsByCommunityId,
} from "./cms";
import {
  buildCommunityMarketSummary,
  formatRentRange,
  type CommunityMarketSummary,
} from "@/lib/market-intelligence/summary";
import { prisma } from "@/lib/prisma";
import { resolveCommunitySlug } from "@/server/market-intelligence/community-matcher";
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

function summaryFromManualCms(
  communitySlug: string,
  cms: NonNullable<Awaited<ReturnType<typeof getCommunityIntelligenceCmsByCommunityId>>>
): CommunityMarketSummary {
  const manual = cms.manual;

  return {
    communitySlug,
    communityName: cms.communityName,
    available: true,
    averageSalePrice: manual.averageSalePriceAed,
    lowestSalePrice: manual.averageSalePriceAed,
    highestSalePrice: manual.averageSalePriceAed,
    averageRent: manual.averageRentAedYear,
    furnishedRentMin: manual.averageRentAedYear,
    furnishedRentMax: manual.averageRentAedYear,
    unfurnishedRentMin: manual.averageRentAedYear,
    unfurnishedRentMax: manual.averageRentAedYear,
    roi: manual.averageRoiPercent,
    pricePerSqft: manual.averagePricePerSqftAed,
    demand: cms.rentalDemand,
    confidence: null,
    isEstimated: false,
    profiles: [],
  };
}

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

/** Public market page — saved CMS manual values only; otherwise not yet researched. */
export async function listCommunityMarketSummaries(): Promise<
  CommunityMarketSummary[]
> {
  try {
    const [communities, researchProfiles] = await Promise.all([
      prisma.community.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
      listMarketProfiles(),
    ]);

    const summaries: CommunityMarketSummary[] = [];
    const listedSlugs = new Set<string>();

    for (const community of communities) {
      listedSlugs.add(community.slug);
      const cms = await getCommunityIntelligenceCmsByCommunityId(community.id);
      if (cms?.hasManualProfile) {
        summaries.push(summaryFromManualCms(community.slug, cms));
      } else {
        summaries.push(emptySummary(community.slug, community.name));
      }
    }

    const researchGroups = new Map<string, string>();
    for (const profile of researchProfiles) {
      if (!researchGroups.has(profile.communitySlug)) {
        researchGroups.set(profile.communitySlug, profile.communityName);
      }
    }

    for (const [slug, name] of researchGroups) {
      if (listedSlugs.has(slug)) continue;
      const communityId = await findCommunityIdByName(name);
      const cms = communityId
        ? await getCommunityIntelligenceCmsByCommunityId(communityId)
        : null;
      if (cms?.hasManualProfile) {
        summaries.push(summaryFromManualCms(slug, cms));
      } else {
        summaries.push(emptySummary(slug, name));
      }
    }

    return summaries.sort((a, b) => a.communityName.localeCompare(b.communityName));
  } catch (error) {
    console.error("[market-intelligence] listCommunityMarketSummaries:", error);
    return [];
  }
}

export async function getCommunityMarketSummaryByName(
  communityName: string,
  bedroomCount?: number
): Promise<CommunityMarketSummary | null> {
  const communityId = await findCommunityIdByName(communityName);
  if (communityId) {
    const cms = await getCommunityIntelligenceCmsByCommunityId(communityId);
    if (cms?.hasManualProfile) {
      return summaryFromManualCms(
        resolveCommunitySlug(communityName) ?? cms.communityName,
        cms
      );
    }
  }

  const slug = resolveCommunitySlug(communityName);
  if (!slug) {
    return communityId
      ? emptySummary(communityName.toLowerCase().replace(/\s+/g, "-"), communityName)
      : null;
  }

  if (communityId) {
    return emptySummary(slug, communityName);
  }

  return getCommunityMarketSummary(slug, bedroomCount);
}
