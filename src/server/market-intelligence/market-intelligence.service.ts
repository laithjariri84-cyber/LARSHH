import type { Furnishing, ListingType } from "@prisma/client";

import {
  bedroomLabel,
  normalizeBedroomCount,
  resolveCommunitySlug,
} from "./community-matcher";
import { findMarketProfile } from "./market-intelligence.repository";
import type {
  MarketRecommendation,
  PropertyMarketIntelligence,
  RecommendationTone,
} from "./market-intelligence.types";

type ComputeInput = {
  communityName: string;
  bedrooms: number | null;
  listingType: ListingType | null;
  furnishing: Furnishing | null;
  askingPrice: number | null;
  askingRent: number | null;
  askingSale: number | null;
};

function isFurnished(furnishing: Furnishing | null): boolean {
  return furnishing === "FULLY_FURNISHED" || furnishing === "PARTIALLY_FURNISHED";
}

function resolveCurrentAskingPrice(input: ComputeInput): number | null {
  if (input.listingType === "RENT") {
    return input.askingRent ?? input.askingPrice;
  }

  if (input.listingType === "SALE") {
    return input.askingSale ?? input.askingPrice;
  }

  return input.askingSale ?? input.askingRent ?? input.askingPrice;
}

function resolveMarketRange(
  input: ComputeInput,
  profile: NonNullable<Awaited<ReturnType<typeof findMarketProfile>>>
): { low: number | null; high: number | null; average: number | null } {
  if (input.listingType === "RENT") {
    const furnished = isFurnished(input.furnishing);
    return {
      low: furnished ? profile.rentFurnishedMin : profile.rentUnfurnishedMin,
      high: furnished ? profile.rentFurnishedMax : profile.rentUnfurnishedMax,
      average: furnished ? profile.rentFurnishedAvg : profile.rentUnfurnishedAvg,
    };
  }

  return {
    low: profile.saleAskingLowest,
    high: profile.saleAskingHighest,
    average: profile.saleAskingAvg,
  };
}

function resolveAverageRent(
  profile: NonNullable<Awaited<ReturnType<typeof findMarketProfile>>>,
  furnishing: Furnishing | null
): { value: number | null; estimated: boolean } {
  const furnished = isFurnished(furnishing);

  if (furnished) {
    return {
      value: profile.rentFurnishedAvg,
      estimated: profile.rentFurnishedEstimated,
    };
  }

  return {
    value: profile.rentUnfurnishedAvg,
    estimated: profile.rentUnfurnishedEstimated,
  };
}

function classifyRecommendation(
  differencePercent: number | null
): { recommendation: MarketRecommendation; tone: RecommendationTone } | null {
  if (differencePercent === null) return null;

  if (differencePercent <= -8) {
    return { recommendation: "Excellent Deal", tone: "green" };
  }

  if (differencePercent <= -3) {
    return { recommendation: "Good Value", tone: "green" };
  }

  if (differencePercent < 3) {
    return { recommendation: "Fair Price", tone: "yellow" };
  }

  if (differencePercent < 10) {
    return { recommendation: "Above Market", tone: "orange" };
  }

  return { recommendation: "Overpriced", tone: "red" };
}

function formatDifferenceLabel(differencePercent: number | null): string | null {
  if (differencePercent === null) return null;

  const rounded = Math.round(Math.abs(differencePercent) * 10) / 10;
  if (rounded === 0) return "At market";

  const direction = differencePercent < 0 ? "below" : "above";
  return `${rounded}% ${direction} market`;
}

export async function computePropertyMarketIntelligence(
  input: ComputeInput
): Promise<PropertyMarketIntelligence | null> {
  const communitySlug = resolveCommunitySlug(input.communityName);
  if (!communitySlug) return null;
  const bedroomCount = normalizeBedroomCount(input.bedrooms);
  const profile = await findMarketProfile(communitySlug, bedroomCount);
  if (!profile) return null;

  const currentAskingPrice = resolveCurrentAskingPrice(input);
  const marketRange = resolveMarketRange(input, profile);
  const averageRent = resolveAverageRent(profile, input.furnishing);

  const differenceFromMarketPercent =
    currentAskingPrice !== null && marketRange.average
      ? ((currentAskingPrice - marketRange.average) / marketRange.average) * 100
      : null;

  const recommendation = classifyRecommendation(differenceFromMarketPercent);
  const estimatedYieldPercent =
    profile.estimatedRoiPercent ??
    (averageRent.value && profile.saleAskingAvg
      ? Math.round((averageRent.value / profile.saleAskingAvg) * 10000) / 100
      : null);

  return {
    communityName: profile.communityName,
    communitySlug: profile.communitySlug,
    bedroomLabel: bedroomLabel(bedroomCount),
    currency: "AED",
    isEstimated: profile.isEstimated,
    currentAskingPrice,
    marketRangeLow: marketRange.low,
    marketRangeHigh: marketRange.high,
    averageMarketPrice: marketRange.average,
    differenceFromMarketPercent,
    differenceFromMarketLabel: formatDifferenceLabel(differenceFromMarketPercent),
    differenceDirection:
      differenceFromMarketPercent === null
        ? null
        : differenceFromMarketPercent < -0.5
          ? "below"
          : differenceFromMarketPercent > 0.5
            ? "above"
            : "at",
    estimatedRoiPercent: profile.estimatedRoiPercent,
    averageRent: averageRent.value,
    averageRentEstimated: averageRent.estimated,
    estimatedYieldPercent,
    averagePricePerSqft: profile.averagePricePerSqft,
    demand: profile.demand,
    confidencePercent: profile.confidencePercent,
    recommendation: recommendation?.recommendation ?? null,
    recommendationTone: recommendation?.tone ?? null,
    listingType: input.listingType,
    furnishing: input.furnishing,
    profileNotes: profile.notes,
  };
}
