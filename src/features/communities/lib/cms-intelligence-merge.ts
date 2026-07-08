import type { CommunityIntelligenceCmsRecord } from "@/server/market-intelligence/cms";
import { formatCurrency } from "@/lib/utils";

import type { CommunityIntelligence, IntelligenceListItem, IntelligenceMetric } from "../types";

function nearbyToListItems(places: { title: string; meta?: string }[], prefix: string): IntelligenceListItem[] {
  return places.map((place, index) => ({
    id: `${prefix}-${index}`,
    title: place.title,
    meta: place.meta,
  }));
}

function metric(label: string, value: number | null, suffix = ""): IntelligenceMetric {
  return {
    label,
    value:
      value === null
        ? "Market data not available"
        : `${formatCurrency(value, "AED")}${suffix}`,
  };
}

export function mergeCmsIntoCommunityIntelligence(
  base: CommunityIntelligence,
  cms: CommunityIntelligenceCmsRecord | null
): CommunityIntelligence {
  if (!cms) return base;

  const marketTrends = [
    cms.marketNotes,
    cms.capitalAppreciationPercent !== null
      ? `Capital appreciation benchmark: ${cms.capitalAppreciationPercent}%`
      : null,
    cms.rentalDemand ? `Rental demand: ${cms.rentalDemand}` : null,
    cms.occupancyRatePercent !== null
      ? `Occupancy rate: ${cms.occupancyRatePercent}%`
      : null,
  ].filter((value): value is string => Boolean(value));

  const lifestyle = [
    cms.bestFor,
    cms.walkability ? `Walkability: ${cms.walkability}` : null,
    cms.beachAccess ? `Beach access: ${cms.beachAccess}` : null,
    cms.luxuryScore !== null ? `Luxury score: ${cms.luxuryScore}/10` : null,
    cms.familyScore !== null ? `Family score: ${cms.familyScore}/10` : null,
    cms.lifestyleScore !== null ? `Lifestyle score: ${cms.lifestyleScore}/10` : null,
  ].filter((value): value is string => Boolean(value));

  const notes = [
    cms.thingsBuyersShouldKnow,
    cms.thingsInvestorsShouldKnow,
    cms.hiddenMarketInsights,
    cms.futureDevelopments,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    ...base,
    overview: cms.overview ?? base.overview,
    averageRent: metric("Average Rent", cms.averageRentAedYear, "/yr"),
    averageSale: metric("Average Sale Price", cms.averageSalePriceAed),
    roi: {
      label: "Average ROI",
      value:
        cms.averageRoiPercent === null
          ? "Market data not available"
          : `${cms.averageRoiPercent}%`,
      hint:
        cms.investmentScore !== null
          ? `Investment score: ${cms.investmentScore}/10`
          : undefined,
    },
    pricePerSqft: metric("Average Price per Sq.ft", cms.averagePricePerSqftAed),
    marketTrends: marketTrends.length ? marketTrends : base.marketTrends,
    lifestyle: lifestyle.length ? lifestyle : base.lifestyle,
    nearbySchools: cms.nearbySchools.length
      ? nearbyToListItems(cms.nearbySchools, "school")
      : base.nearbySchools,
    nearbyHotels: cms.nearbyHotels.length
      ? nearbyToListItems(cms.nearbyHotels, "hotel")
      : base.nearbyHotels,
    nearbyRestaurants: cms.nearbyRestaurants.length
      ? nearbyToListItems(cms.nearbyRestaurants, "restaurant")
      : base.nearbyRestaurants,
    notes: notes || base.notes,
    unitTypes: cms.unitTypes
      .filter((row) => row.averageSalePriceAed !== null || row.averageRentAedYear !== null)
      .map((row, index) => ({
        id: `cms-unit-${index}`,
        title: row.unitType.replace(/_/g, " "),
        meta: [
          row.averageSalePriceAed !== null
            ? `Sale ${formatCurrency(row.averageSalePriceAed, "AED")}`
            : null,
          row.averageRentAedYear !== null
            ? `Rent ${formatCurrency(row.averageRentAedYear, "AED")}/yr`
            : null,
        ]
          .filter(Boolean)
          .join(" · "),
      })),
  };
}
