import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { cacheMarketProfiles, cacheMarketRoiProfiles } from "@/lib/server-cache";
import { perfAsync } from "@/lib/perf/timer";

import type {
  CommunityMarketProfileRecord,
  UpdateCommunityMarketProfileInput,
} from "./market-intelligence.types";

export type MarketRoiProfile = {
  communitySlug: string;
  bedroomCount: number;
  estimatedRoiPercent: number | null;
};

function decimalToNumber(value: Prisma.Decimal | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

function mapProfile(
  row: Prisma.CommunityMarketIntelligenceGetPayload<object>
): CommunityMarketProfileRecord {
  return {
    id: row.id,
    communitySlug: row.communitySlug,
    communityName: row.communityName,
    bedroomCount: row.bedroomCount,
    rentFurnishedMin: decimalToNumber(row.rentFurnishedMin),
    rentFurnishedAvg: decimalToNumber(row.rentFurnishedAvg),
    rentFurnishedMax: decimalToNumber(row.rentFurnishedMax),
    rentFurnishedEstimated: row.rentFurnishedEstimated,
    rentUnfurnishedMin: decimalToNumber(row.rentUnfurnishedMin),
    rentUnfurnishedAvg: decimalToNumber(row.rentUnfurnishedAvg),
    rentUnfurnishedMax: decimalToNumber(row.rentUnfurnishedMax),
    rentUnfurnishedEstimated: row.rentUnfurnishedEstimated,
    saleAskingLowest: decimalToNumber(row.saleAskingLowest),
    saleAskingAvg: decimalToNumber(row.saleAskingAvg),
    saleAskingHighest: decimalToNumber(row.saleAskingHighest),
    saleAskingEstimated: row.saleAskingEstimated,
    saleSoldLowest: decimalToNumber(row.saleSoldLowest),
    saleSoldAvg: decimalToNumber(row.saleSoldAvg),
    saleSoldHighest: decimalToNumber(row.saleSoldHighest),
    saleSoldEstimated: row.saleSoldEstimated,
    averageSizeSqft: decimalToNumber(row.averageSizeSqft),
    averagePricePerSqft: decimalToNumber(row.averagePricePerSqft),
    estimatedRoiPercent: decimalToNumber(row.estimatedRoiPercent),
    demand: row.demand,
    confidencePercent: decimalToNumber(row.confidencePercent),
    isEstimated: row.isEstimated,
    notes: row.notes,
  };
}

export async function findMarketProfile(
  communitySlug: string,
  bedroomCount: number
): Promise<CommunityMarketProfileRecord | null> {
  try {
    const row = await prisma.communityMarketIntelligence.findUnique({
      where: {
        communitySlug_bedroomCount: {
          communitySlug,
          bedroomCount,
        },
      },
    });

    return row ? mapProfile(row) : null;
  } catch (error) {
    console.error("[RSC ERROR] scope=market-intelligence.repository:findMarketProfile", error);
    return null;
  }
}

async function fetchMarketProfilesFromDb(): Promise<CommunityMarketProfileRecord[]> {
  const rows = await prisma.communityMarketIntelligence.findMany({
    orderBy: [{ communityName: "asc" }, { bedroomCount: "asc" }],
  });

  return rows.map(mapProfile);
}

export async function listMarketProfiles(): Promise<CommunityMarketProfileRecord[]> {
  return perfAsync("listMarketProfiles", async () => {
    try {
      return await cacheMarketProfiles(fetchMarketProfilesFromDb);
    } catch (error) {
      console.error(
        "[RSC ERROR] scope=market-intelligence.repository:listMarketProfiles",
        error
      );
      return [];
    }
  });
}

async function fetchMarketRoiProfilesFromDb(): Promise<MarketRoiProfile[]> {
  const rows = await prisma.communityMarketIntelligence.findMany({
    select: {
      communitySlug: true,
      bedroomCount: true,
      estimatedRoiPercent: true,
    },
    orderBy: [{ communitySlug: "asc" }, { bedroomCount: "asc" }],
  });

  return rows.map((row) => ({
    communitySlug: row.communitySlug,
    bedroomCount: row.bedroomCount,
    estimatedRoiPercent: decimalToNumber(row.estimatedRoiPercent),
  }));
}

/** Slim profile list for search ROI enrichment — 3 columns vs full row. */
export async function listMarketRoiProfiles(): Promise<MarketRoiProfile[]> {
  return perfAsync("listMarketRoiProfiles", async () => {
    try {
      return await cacheMarketRoiProfiles(fetchMarketRoiProfilesFromDb);
    } catch (error) {
      console.error(
        "[RSC ERROR] scope=market-intelligence.repository:listMarketRoiProfiles",
        error
      );
      return [];
    }
  });
}

export async function listMarketProfilesByCommunitySlug(
  communitySlug: string
): Promise<CommunityMarketProfileRecord[]> {
  try {
    const rows = await prisma.communityMarketIntelligence.findMany({
      where: { communitySlug },
      orderBy: { bedroomCount: "asc" },
    });

    return rows.map(mapProfile);
  } catch (error) {
    console.error(
      "[RSC ERROR] scope=market-intelligence.repository:listMarketProfilesByCommunitySlug",
      error
    );
    return [];
  }
}

export async function updateMarketProfile(
  id: string,
  input: UpdateCommunityMarketProfileInput
): Promise<CommunityMarketProfileRecord> {
  const row = await prisma.communityMarketIntelligence.update({
    where: { id },
    data: input,
  });

  return mapProfile(row);
}
