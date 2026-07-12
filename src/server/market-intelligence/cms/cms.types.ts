import type { IntelligenceUnitCategory, MarketDemandLevel } from "@prisma/client";

export type NearbyPlace = {
  title: string;
  meta?: string;
};

export type CommunityIntelligenceUnitBenchmarkRecord = {
  unitType: IntelligenceUnitCategory;
  averageSalePriceAed: number | null;
  averageRentAedYear: number | null;
  averagePricePerSqftAed: number | null;
  /** True when values come from listing aggregation, not manual CMS entry. */
  isCalculated: boolean;
};

/** Stored CMS values only (no listing-calculated fallbacks). */
export type CommunityIntelligenceCmsManualSnapshot = {
  averageSalePriceAed: number | null;
  averageRentAedYear: number | null;
  averagePricePerSqftAed: number | null;
  averageRoiPercent: number | null;
  unitTypes: Array<{
    unitType: IntelligenceUnitCategory;
    averageSalePriceAed: number | null;
    averageRentAedYear: number | null;
    averagePricePerSqftAed: number | null;
  }>;
};

/** Listing-derived benchmarks when no manual CMS override exists. */
export type CommunityIntelligenceCmsCalculatedSnapshot =
  CommunityIntelligenceCmsManualSnapshot;

export type CommunityIntelligenceCmsRecord = {
  id: string;
  communityId: string;
  communityName: string;
  masterCommunityName: string;
  overview: string | null;
  investmentSummary: string | null;
  bestFor: string | null;
  pros: string[];
  cons: string[];
  marketNotes: string | null;
  averageSalePriceAed: number | null;
  averageRentAedYear: number | null;
  averagePricePerSqftAed: number | null;
  averageRoiPercent: number | null;
  capitalAppreciationPercent: number | null;
  rentalDemand: MarketDemandLevel | null;
  occupancyRatePercent: number | null;
  luxuryScore: number | null;
  familyScore: number | null;
  investmentScore: number | null;
  lifestyleScore: number | null;
  walkability: string | null;
  beachAccess: string | null;
  shortTermRentalScore: number | null;
  longTermRentalScore: number | null;
  nearbySchools: NearbyPlace[];
  nearbyHospitals: NearbyPlace[];
  nearbyRestaurants: NearbyPlace[];
  nearbySupermarkets: NearbyPlace[];
  nearbyHotels: NearbyPlace[];
  nearbyShopping: NearbyPlace[];
  hiddenMarketInsights: string | null;
  futureDevelopments: string | null;
  thingsBuyersShouldKnow: string | null;
  thingsInvestorsShouldKnow: string | null;
  updatedByEmail: string | null;
  updatedByName: string | null;
  updatedAt: string | null;
  unitTypes: CommunityIntelligenceUnitBenchmarkRecord[];
  /** Fields resolved from CMS manual values or listing calculations. */
  sources: {
    averageSalePriceAed: "manual" | "calculated" | null;
    averageRentAedYear: "manual" | "calculated" | null;
    averagePricePerSqftAed: "manual" | "calculated" | null;
    averageRoiPercent: "manual" | "calculated" | null;
  };
  /** Raw manual CMS values for admin editing (excludes calculated fallbacks). */
  manual: CommunityIntelligenceCmsManualSnapshot;
  /** Listing-calculated benchmarks for admin hints and public fallback. */
  calculated: CommunityIntelligenceCmsCalculatedSnapshot;
  /** CommunityMarketIntelligence research DB values for pre-filling the editor. */
  research: CommunityIntelligenceCmsManualSnapshot | null;
  hasManualProfile: boolean;
  hasResearchProfile: boolean;
};

export type CommunityListItem = {
  id: string;
  name: string;
  slug: string;
  masterCommunityName: string;
  hasCmsProfile: boolean;
  hasResearchProfile: boolean;
  updatedAt: string | null;
};

export type UpsertCommunityIntelligenceCmsInput = {
  communityName: string;
  overview?: string | null;
  investmentSummary?: string | null;
  bestFor?: string | null;
  pros?: string[];
  cons?: string[];
  marketNotes?: string | null;
  averageSalePriceAed?: number | null;
  averageRentAedYear?: number | null;
  averagePricePerSqftAed?: number | null;
  averageRoiPercent?: number | null;
  capitalAppreciationPercent?: number | null;
  rentalDemand?: MarketDemandLevel | null;
  occupancyRatePercent?: number | null;
  luxuryScore?: number | null;
  familyScore?: number | null;
  investmentScore?: number | null;
  lifestyleScore?: number | null;
  walkability?: string | null;
  beachAccess?: string | null;
  shortTermRentalScore?: number | null;
  longTermRentalScore?: number | null;
  nearbySchools?: NearbyPlace[];
  nearbyHospitals?: NearbyPlace[];
  nearbyRestaurants?: NearbyPlace[];
  nearbySupermarkets?: NearbyPlace[];
  nearbyHotels?: NearbyPlace[];
  nearbyShopping?: NearbyPlace[];
  hiddenMarketInsights?: string | null;
  futureDevelopments?: string | null;
  thingsBuyersShouldKnow?: string | null;
  thingsInvestorsShouldKnow?: string | null;
  unitTypes?: Array<{
    unitType: IntelligenceUnitCategory;
    averageSalePriceAed?: number | null;
    averageRentAedYear?: number | null;
    averagePricePerSqftAed?: number | null;
  }>;
};

export const INTELLIGENCE_UNIT_CATEGORIES: IntelligenceUnitCategory[] = [
  "STUDIO",
  "ONE_BEDROOM",
  "TWO_BEDROOM",
  "THREE_BEDROOM",
  "FOUR_BEDROOM",
  "TOWNHOUSE",
  "VILLA",
];

export const INTELLIGENCE_UNIT_LABELS: Record<IntelligenceUnitCategory, string> = {
  STUDIO: "Studios",
  ONE_BEDROOM: "1 Bedroom",
  TWO_BEDROOM: "2 Bedroom",
  THREE_BEDROOM: "3 Bedroom",
  FOUR_BEDROOM: "4 Bedroom",
  TOWNHOUSE: "Townhouses",
  VILLA: "Villas",
};
