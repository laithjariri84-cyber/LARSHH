export type MarketScoreLevel =
  | "excellent_investment"
  | "good_investment"
  | "average"
  | "overpriced_area";

export type MarketFilters = {
  masterCommunity: string;
  community: string;
  building: string;
  propertyType: string;
  bedrooms: string;
  furnishing: string;
  view: string;
};

export type MarketSummary = {
  averageAskingPrice: number;
  averageRent: number;
  averagePricePerSqft: number;
  averageRoi: number;
  lowestListing: number;
  highestListing: number;
  medianPrice: number;
  activeListings: number;
  averageDaysOnMarket: number;
};

export type DistributionBucket = {
  label: string;
  count: number;
  percentage: number;
};

export type TrendPoint = {
  label: string;
  value: number;
};

export type MarketScore = {
  level: MarketScoreLevel;
  score: number;
  headline: string;
  rationale: string;
};

export type ComparableListing = {
  id: string;
  property: string;
  building: string;
  price: number;
  size: number;
  pricePerSqft: number;
  differencePercent: number;
  status: "Active" | "Under Offer" | "Pending" | "Sold";
};

export type MarketAnalytics = {
  summary: MarketSummary;
  priceDistribution: DistributionBucket[];
  rentalTrend: TrendPoint[];
  salesTrend: TrendPoint[];
  marketScore: MarketScore;
  comparables: ComparableListing[];
};
