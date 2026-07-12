import type { IntelligenceUnitCategory } from "@prisma/client";

import { buildCommunityMarketSummary } from "@/lib/market-intelligence/summary";
import { prisma } from "@/lib/prisma";

import { resolveCommunitySlug } from "../community-matcher";
import { listMarketProfilesByCommunitySlug } from "../market-intelligence.repository";
import type { CommunityIntelligenceCmsManualSnapshot } from "./cms.types";
import { INTELLIGENCE_UNIT_CATEGORIES } from "./cms.types";

const BEDROOM_TO_UNIT: Record<number, IntelligenceUnitCategory> = {
  0: "STUDIO",
  1: "ONE_BEDROOM",
  2: "TWO_BEDROOM",
  3: "THREE_BEDROOM",
  4: "FOUR_BEDROOM",
  5: "FOUR_BEDROOM",
};

function decimal(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

async function loadProfilesForCommunity(communityName: string, slug: string) {
  const resolvedSlug = resolveCommunitySlug(communityName) ?? slug;
  let profiles = await listMarketProfilesByCommunitySlug(resolvedSlug);

  if (profiles.length === 0) {
    const rows = await prisma.communityMarketIntelligence.findMany({
      where: {
        OR: [
          { communitySlug: resolvedSlug },
          { communityName: { equals: communityName, mode: "insensitive" } },
        ],
      },
      orderBy: { bedroomCount: "asc" },
    });

    if (rows.length === 0) return [];

    profiles = rows.map((row) => ({
      id: row.id,
      communitySlug: row.communitySlug,
      communityName: row.communityName,
      bedroomCount: row.bedroomCount,
      rentFurnishedMin: decimal(row.rentFurnishedMin),
      rentFurnishedAvg: decimal(row.rentFurnishedAvg),
      rentFurnishedMax: decimal(row.rentFurnishedMax),
      rentFurnishedEstimated: row.rentFurnishedEstimated,
      rentUnfurnishedMin: decimal(row.rentUnfurnishedMin),
      rentUnfurnishedAvg: decimal(row.rentUnfurnishedAvg),
      rentUnfurnishedMax: decimal(row.rentUnfurnishedMax),
      rentUnfurnishedEstimated: row.rentUnfurnishedEstimated,
      saleAskingLowest: decimal(row.saleAskingLowest),
      saleAskingAvg: decimal(row.saleAskingAvg),
      saleAskingHighest: decimal(row.saleAskingHighest),
      saleAskingEstimated: row.saleAskingEstimated,
      saleSoldLowest: decimal(row.saleSoldLowest),
      saleSoldAvg: decimal(row.saleSoldAvg),
      saleSoldHighest: decimal(row.saleSoldHighest),
      saleSoldEstimated: row.saleSoldEstimated,
      averageSizeSqft: decimal(row.averageSizeSqft),
      averagePricePerSqft: decimal(row.averagePricePerSqft),
      estimatedRoiPercent: decimal(row.estimatedRoiPercent),
      demand: row.demand,
      confidencePercent: decimal(row.confidencePercent),
      isEstimated: row.isEstimated,
      notes: row.notes,
    }));
  }

  return profiles;
}

/** Aggregates CommunityMarketIntelligence rows into CMS-compatible editable values. */
export async function loadResearchSnapshotForCommunity(
  communityName: string,
  slug: string
): Promise<CommunityIntelligenceCmsManualSnapshot | null> {
  const profiles = await loadProfilesForCommunity(communityName, slug);
  if (profiles.length === 0) return null;

  const summary = buildCommunityMarketSummary(
    resolveCommunitySlug(communityName) ?? slug,
    communityName,
    profiles
  );

  const unitMap = new Map<
    IntelligenceUnitCategory,
    {
      averageSalePriceAed: number | null;
      averageRentAedYear: number | null;
      averagePricePerSqftAed: number | null;
    }
  >();

  for (const profile of profiles) {
    const unitType = BEDROOM_TO_UNIT[profile.bedroomCount];
    if (!unitType) continue;
    unitMap.set(unitType, {
      averageSalePriceAed: profile.saleAskingAvg,
      averageRentAedYear: profile.rentUnfurnishedAvg,
      averagePricePerSqftAed: profile.averagePricePerSqft,
    });
  }

  return {
    averageSalePriceAed: summary.averageSalePrice,
    averageRentAedYear: summary.averageRent,
    averagePricePerSqftAed: summary.pricePerSqft,
    averageRoiPercent: summary.roi,
    unitTypes: INTELLIGENCE_UNIT_CATEGORIES.map((unitType) => {
      const row = unitMap.get(unitType);
      return {
        unitType,
        averageSalePriceAed: row?.averageSalePriceAed ?? null,
        averageRentAedYear: row?.averageRentAedYear ?? null,
        averagePricePerSqftAed: row?.averagePricePerSqftAed ?? null,
      };
    }),
  };
}

export async function communityHasResearchProfile(
  communityName: string,
  slug: string
): Promise<boolean> {
  const profiles = await loadProfilesForCommunity(communityName, slug);
  return profiles.length > 0;
}
