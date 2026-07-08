import type { Furnishing, ListingType } from "@prisma/client";

import {
  bedroomLabel,
  normalizeBedroomCount,
  resolveCommunitySlug,
} from "./community-matcher";
import {
  findCommunityIdByName,
  getCommunityIntelligenceCmsByCommunityId,
} from "./cms";
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

  const communityId = await findCommunityIdByName(input.communityName);
  const cms = communityId
    ? await getCommunityIntelligenceCmsByCommunityId(communityId)
    : null;

  const profile = await findMarketProfile(communitySlug, bedroomCount);

  const cmsUnit = cms?.unitTypes.find((row) => {
    if (bedroomCount === 0) return row.unitType === "STUDIO";
    if (bedroomCount === 1) return row.unitType === "ONE_BEDROOM";
    if (bedroomCount === 2) return row.unitType === "TWO_BEDROOM";
    if (bedroomCount === 3) return row.unitType === "THREE_BEDROOM";
    if (bedroomCount >= 4) return row.unitType === "FOUR_BEDROOM";
    return false;
  });

  const effectiveSaleAvg =
    cmsUnit?.averageSalePriceAed ??
    cms?.averageSalePriceAed ??
    profile?.saleAskingAvg ??
    null;
  const effectiveRentAvg =
    cmsUnit?.averageRentAedYear ??
    cms?.averageRentAedYear ??
    (profile
      ? isFurnished(input.furnishing)
        ? profile.rentFurnishedAvg
        : profile.rentUnfurnishedAvg
      : null);
  const effectivePsf =
    cmsUnit?.averagePricePerSqftAed ??
    cms?.averagePricePerSqftAed ??
    profile?.averagePricePerSqft ??
    null;
  const effectiveRoi =
    cms?.averageRoiPercent ?? profile?.estimatedRoiPercent ?? null;

  if (!profile && !cms) return null;

  const mergedProfile = profile
    ? {
        ...profile,
        saleAskingAvg: effectiveSaleAvg ?? profile.saleAskingAvg,
        rentFurnishedAvg: effectiveRentAvg ?? profile.rentFurnishedAvg,
        rentUnfurnishedAvg: effectiveRentAvg ?? profile.rentUnfurnishedAvg,
        averagePricePerSqft: effectivePsf ?? profile.averagePricePerSqft,
        estimatedRoiPercent: effectiveRoi ?? profile.estimatedRoiPercent,
        demand: cms?.rentalDemand ?? profile.demand,
        communityName: cms?.communityName ?? profile.communityName,
        notes: cms?.marketNotes ?? profile.notes,
      }
    : {
        id: cms!.communityId,
        communitySlug,
        communityName: cms!.communityName,
        bedroomCount,
        rentFurnishedMin: effectiveRentAvg,
        rentFurnishedAvg: effectiveRentAvg,
        rentFurnishedMax: effectiveRentAvg,
        rentFurnishedEstimated: cmsUnit?.isCalculated ?? true,
        rentUnfurnishedMin: effectiveRentAvg,
        rentUnfurnishedAvg: effectiveRentAvg,
        rentUnfurnishedMax: effectiveRentAvg,
        rentUnfurnishedEstimated: cmsUnit?.isCalculated ?? true,
        saleAskingLowest: effectiveSaleAvg,
        saleAskingAvg: effectiveSaleAvg,
        saleAskingHighest: effectiveSaleAvg,
        saleAskingEstimated: cmsUnit?.isCalculated ?? true,
        saleSoldLowest: null,
        saleSoldAvg: null,
        saleSoldHighest: null,
        saleSoldEstimated: true,
        averageSizeSqft: null,
        averagePricePerSqft: effectivePsf,
        estimatedRoiPercent: effectiveRoi,
        demand: cms?.rentalDemand ?? null,
        confidencePercent: null,
        isEstimated: cmsUnit?.isCalculated ?? true,
        notes: cms?.marketNotes ?? null,
      };

  const currentAskingPrice = resolveCurrentAskingPrice(input);
  const marketRange = resolveMarketRange(input, mergedProfile);
  const averageRent = resolveAverageRent(mergedProfile, input.furnishing);

  const differenceFromMarketPercent =
    currentAskingPrice !== null && marketRange.average
      ? ((currentAskingPrice - marketRange.average) / marketRange.average) * 100
      : null;

  const recommendation = classifyRecommendation(differenceFromMarketPercent);
  const estimatedYieldPercent =
    mergedProfile.estimatedRoiPercent ??
    (averageRent.value && mergedProfile.saleAskingAvg
      ? Math.round((averageRent.value / mergedProfile.saleAskingAvg) * 10000) / 100
      : null);

  return {
    communityName: mergedProfile.communityName,
    communitySlug: mergedProfile.communitySlug,
    bedroomLabel: bedroomLabel(bedroomCount),
    currency: "AED",
    isEstimated: mergedProfile.isEstimated,
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
    estimatedRoiPercent: mergedProfile.estimatedRoiPercent,
    averageRent: averageRent.value,
    averageRentEstimated: averageRent.estimated,
    estimatedYieldPercent,
    averagePricePerSqft: mergedProfile.averagePricePerSqft,
    demand: mergedProfile.demand,
    confidencePercent: mergedProfile.confidencePercent,
    recommendation: recommendation?.recommendation ?? null,
    recommendationTone: recommendation?.tone ?? null,
    listingType: input.listingType,
    furnishing: input.furnishing,
    profileNotes: mergedProfile.notes,
  };
}
