import type { IntelligenceFilters } from "../types";
import {
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  FURNISHING_OPTIONS,
  getBuildingsForCommunity,
  getCommunitiesForMaster,
  MASTER_COMMUNITY_NAMES,
  PROPERTY_TYPES,
  VIEW_OPTIONS,
} from "../data/filter-options";

export function createDefaultIntelligenceFilters(): IntelligenceFilters {
  const masterCommunity = MASTER_COMMUNITY_NAMES[0];
  const community = getCommunitiesForMaster(masterCommunity)[0] ?? "";
  const building = getBuildingsForCommunity(community)[0] ?? "";

  return {
    masterCommunity,
    community,
    building,
    purpose: "Sale",
    propertyType: PROPERTY_TYPES[2],
    bedrooms: BEDROOM_OPTIONS[2],
    bathrooms: BATHROOM_OPTIONS[1],
    furnishing: FURNISHING_OPTIONS[0],
    view: VIEW_OPTIONS[0],
    sizeMin: "1000",
    sizeMax: "1800",
  };
}

export function isIntelligenceReady(filters: IntelligenceFilters): boolean {
  return Boolean(
    filters.masterCommunity &&
      filters.community &&
      filters.building &&
      filters.purpose &&
      filters.propertyType
  );
}
