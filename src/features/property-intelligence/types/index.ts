export type IntelligencePurpose = "Rent" | "Sale";

export type TrendDirection = "up" | "down" | "stable";

export type SupplyDemandLevel = "Low" | "Balanced" | "High" | "Very High";

export type IntelligenceFilters = {
  masterCommunity: string;
  community: string;
  building: string;
  purpose: IntelligencePurpose;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  furnishing: string;
  view: string;
  sizeMin: string;
  sizeMax: string;
};

export type IntelligenceReport = {
  estimatedMarketValue: number;
  suggestedListingPrice: number;
  suggestedClosingPrice: number;
  averageAskingPrice: number;
  lowestAskingPrice: number;
  highestAskingPrice: number;
  averagePricePerSqft: number;
  averageRoi: number;
  averageDaysOnMarket: number;
  holidayHomeScore: number;
  investmentScore: number;
  rentalYield: number;
  priceTrend: TrendDirection;
  marketTrend: TrendDirection;
  supplyLevel: SupplyDemandLevel;
  demandLevel: SupplyDemandLevel;
  marketConfidence: number;
};

export type ComparableListing = {
  id: string;
  building: string;
  size: number;
  price: number;
  pricePerSqft: number;
  differencePercent: number;
  status: "Active" | "Under Offer" | "Pending" | "Sold";
};

export type IntelligenceAnalytics = {
  report: IntelligenceReport;
  comparables: ComparableListing[];
  scopeLabel: string;
};

export type AiQuestionId =
  | "overpriced"
  | "listing_price"
  | "time_to_sell"
  | "comparables"
  | "negotiation";

export type AiQuestion = {
  id: AiQuestionId;
  label: string;
  prompt: string;
};

export type AiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};
