import {
  BEDROOM_OPTIONS,
  FURNISHING_OPTIONS,
  getBuildingsForCommunity,
  getCommunitiesForMaster,
  MASTER_COMMUNITY_NAMES,
  PROPERTY_TYPES,
  VIEW_OPTIONS,
} from "@/features/market-intelligence/data/filter-options";

export {
  MASTER_COMMUNITY_NAMES,
  PROPERTY_TYPES,
  BEDROOM_OPTIONS,
  FURNISHING_OPTIONS,
  VIEW_OPTIONS,
  getCommunitiesForMaster,
  getBuildingsForCommunity,
};

export const PURPOSE_OPTIONS = ["Rent", "Sale"] as const;

export const BATHROOM_OPTIONS = ["1", "2", "3", "4", "5", "6"] as const;

export const INTELLIGENCE_FILTER_GROUPS = [
  {
    title: "Location",
    fields: ["masterCommunity", "community", "building"] as const,
  },
  {
    title: "Product",
    fields: ["purpose", "propertyType", "bedrooms", "bathrooms"] as const,
  },
  {
    title: "Attributes",
    fields: ["furnishing", "view", "size"] as const,
  },
] as const;
