import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type {
  CommunityMarketProfileRecord,
  UpdateCommunityMarketProfileInput,
} from "./market-intelligence.types";

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
  const row = await prisma.communityMarketIntelligence.findUnique({
    where: {
      communitySlug_bedroomCount: {
        communitySlug,
        bedroomCount,
      },
    },
  });

  return row ? mapProfile(row) : null;
}

export async function listMarketProfiles(): Promise<CommunityMarketProfileRecord[]> {
  const rows = await prisma.communityMarketIntelligence.findMany({
    orderBy: [{ communityName: "asc" }, { bedroomCount: "asc" }],
  });

  return rows.map(mapProfile);
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
