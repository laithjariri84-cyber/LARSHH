import type { Furnishing, ListingType, MarketDemandLevel } from "@prisma/client";

export type MarketRecommendation =
  | "Excellent Deal"
  | "Good Value"
  | "Fair Price"
  | "Above Market"
  | "Overpriced";

export type RecommendationTone = "green" | "yellow" | "orange" | "red";

export type PropertyMarketIntelligence = {
  communityName: string;
  communitySlug: string;
  bedroomLabel: string;
  currency: "AED";
  isEstimated: boolean;
  currentAskingPrice: number | null;
  marketRangeLow: number | null;
  marketRangeHigh: number | null;
  averageMarketPrice: number | null;
  differenceFromMarketPercent: number | null;
  differenceFromMarketLabel: string | null;
  differenceDirection: "below" | "above" | "at" | null;
  estimatedRoiPercent: number | null;
  averageRent: number | null;
  averageRentEstimated: boolean;
  estimatedYieldPercent: number | null;
  averagePricePerSqft: number | null;
  demand: MarketDemandLevel | null;
  confidencePercent: number | null;
  recommendation: MarketRecommendation | null;
  recommendationTone: RecommendationTone | null;
  listingType: ListingType | null;
  furnishing: Furnishing | null;
  profileNotes: string | null;
};

export type CommunityMarketProfileRecord = {
  id: string;
  communitySlug: string;
  communityName: string;
  bedroomCount: number;
  rentFurnishedMin: number | null;
  rentFurnishedAvg: number | null;
  rentFurnishedMax: number | null;
  rentFurnishedEstimated: boolean;
  rentUnfurnishedMin: number | null;
  rentUnfurnishedAvg: number | null;
  rentUnfurnishedMax: number | null;
  rentUnfurnishedEstimated: boolean;
  saleAskingLowest: number | null;
  saleAskingAvg: number | null;
  saleAskingHighest: number | null;
  saleAskingEstimated: boolean;
  saleSoldLowest: number | null;
  saleSoldAvg: number | null;
  saleSoldHighest: number | null;
  saleSoldEstimated: boolean;
  averageSizeSqft: number | null;
  averagePricePerSqft: number | null;
  estimatedRoiPercent: number | null;
  demand: MarketDemandLevel | null;
  confidencePercent: number | null;
  isEstimated: boolean;
  notes: string | null;
};

export type UpdateCommunityMarketProfileInput = Partial<
  Omit<CommunityMarketProfileRecord, "id" | "communitySlug" | "communityName" | "bedroomCount">
>;
