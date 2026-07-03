export type IntelligenceSectionKey =
  | "overview"
  | "buildings"
  | "unitTypes"
  | "unitSizes"
  | "activeListings"
  | "averageRent"
  | "averageSale"
  | "roi"
  | "pricePerSqft"
  | "marketTrends"
  | "lifestyle"
  | "nearbySchools"
  | "nearbyHotels"
  | "nearbyRestaurants"
  | "nearbyBeaches"
  | "notes";

export type IntelligenceSectionConfig = {
  key: IntelligenceSectionKey;
  title: string;
  description: string;
};

export type IntelligenceMetric = {
  label: string;
  value: string;
  hint?: string;
};

export type IntelligenceListItem = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
};

export type CommunityIntelligence = {
  overview: string;
  buildings: IntelligenceListItem[];
  unitTypes: IntelligenceListItem[];
  unitSizes: IntelligenceListItem[];
  activeListings: IntelligenceListItem[];
  averageRent: IntelligenceMetric;
  averageSale: IntelligenceMetric;
  roi: IntelligenceMetric;
  pricePerSqft: IntelligenceMetric;
  marketTrends: string[];
  lifestyle: string[];
  nearbySchools: IntelligenceListItem[];
  nearbyHotels: IntelligenceListItem[];
  nearbyRestaurants: IntelligenceListItem[];
  nearbyBeaches: IntelligenceListItem[];
  notes: string;
};

export type ResidentialProject = {
  id: string;
  slug: string;
  name: string;
  masterCommunityId: string;
  tagline: string;
  imageGradient: string;
  intelligence: CommunityIntelligence;
};

export type MasterCommunity = {
  id: string;
  slug: string;
  name: string;
  description: string;
  region: string;
  imageGradient: string;
  projects: ResidentialProject[];
};

export type ProjectRouteParams = {
  masterSlug: string;
  projectSlug: string;
};
