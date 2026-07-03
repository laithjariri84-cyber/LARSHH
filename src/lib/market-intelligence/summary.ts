import type { MarketDemandLevel } from "@prisma/client";

import type { CommunityMarketProfileRecord } from "@/server/market-intelligence/market-intelligence.types";

export type CommunityMarketSummary = {
  communitySlug: string;
  communityName: string;
  available: boolean;
  averageSalePrice: number | null;
  lowestSalePrice: number | null;
  highestSalePrice: number | null;
  averageRent: number | null;
  furnishedRentMin: number | null;
  furnishedRentMax: number | null;
  unfurnishedRentMin: number | null;
  unfurnishedRentMax: number | null;
  roi: number | null;
  pricePerSqft: number | null;
  demand: MarketDemandLevel | null;
  confidence: number | null;
  isEstimated: boolean;
  profiles: CommunityMarketProfileRecord[];
};

function average(values: Array<number | null | undefined>): number | null {
  const filtered = values.filter(
    (value): value is number => value !== null && value !== undefined
  );
  if (filtered.length === 0) return null;
  return Math.round(
    (filtered.reduce((sum, value) => sum + value, 0) / filtered.length) * 100
  ) / 100;
}

function minValue(values: Array<number | null | undefined>): number | null {
  const filtered = values.filter(
    (value): value is number => value !== null && value !== undefined
  );
  return filtered.length ? Math.min(...filtered) : null;
}

function maxValue(values: Array<number | null | undefined>): number | null {
  const filtered = values.filter(
    (value): value is number => value !== null && value !== undefined
  );
  return filtered.length ? Math.max(...filtered) : null;
}

function dominantDemand(
  profiles: CommunityMarketProfileRecord[]
): MarketDemandLevel | null {
  const counts = new Map<MarketDemandLevel, number>();
  for (const profile of profiles) {
    if (!profile.demand) continue;
    counts.set(profile.demand, (counts.get(profile.demand) ?? 0) + 1);
  }

  let winner: MarketDemandLevel | null = null;
  let max = 0;
  for (const [demand, count] of counts) {
    if (count > max) {
      winner = demand;
      max = count;
    }
  }

  return winner;
}

export function buildCommunityMarketSummary(
  communitySlug: string,
  communityName: string,
  profiles: CommunityMarketProfileRecord[]
): CommunityMarketSummary {
  if (profiles.length === 0) {
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

  return {
    communitySlug,
    communityName,
    available: true,
    averageSalePrice: average(profiles.map((p) => p.saleAskingAvg)),
    lowestSalePrice: minValue(profiles.map((p) => p.saleAskingLowest)),
    highestSalePrice: maxValue(profiles.map((p) => p.saleAskingHighest)),
    averageRent: average(profiles.map((p) => p.rentUnfurnishedAvg)),
    furnishedRentMin: minValue(profiles.map((p) => p.rentFurnishedMin)),
    furnishedRentMax: maxValue(profiles.map((p) => p.rentFurnishedMax)),
    unfurnishedRentMin: minValue(profiles.map((p) => p.rentUnfurnishedMin)),
    unfurnishedRentMax: maxValue(profiles.map((p) => p.rentUnfurnishedMax)),
    roi: average(profiles.map((p) => p.estimatedRoiPercent)),
    pricePerSqft: average(profiles.map((p) => p.averagePricePerSqft)),
    demand: dominantDemand(profiles),
    confidence: average(profiles.map((p) => p.confidencePercent)),
    isEstimated: profiles.every((p) => p.isEstimated),
    profiles,
  };
}

export function formatRentRange(
  min: number | null,
  max: number | null
): string | null {
  if (min === null && max === null) return null;
  if (min !== null && max !== null) {
    if (min === max) return `${min.toLocaleString()} AED/yr`;
    return `${min.toLocaleString()} – ${max.toLocaleString()} AED/yr`;
  }
  return `${(min ?? max)?.toLocaleString()} AED/yr`;
}

export function bedroomLabel(count: number): string {
  if (count <= 0) return "Studio";
  if (count === 1) return "1 Bedroom";
  if (count === 2) return "2 Bedroom";
  return "3 Bedroom";
}
