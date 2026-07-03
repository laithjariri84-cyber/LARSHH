import type { MarketFilters } from "../types";
import {
  BEDROOM_OPTIONS,
  FURNISHING_OPTIONS,
  getBuildingsForCommunity,
  getCommunitiesForMaster,
  MASTER_COMMUNITY_NAMES,
  PROPERTY_TYPES,
  VIEW_OPTIONS,
} from "../data/filter-options";

export function createDefaultMarketFilters(): MarketFilters {
  const masterCommunity = MASTER_COMMUNITY_NAMES[0];
  const community = getCommunitiesForMaster(masterCommunity)[0] ?? "";
  const building = getBuildingsForCommunity(community)[0] ?? "";

  return {
    masterCommunity,
    community,
    building,
    propertyType: PROPERTY_TYPES[2],
    bedrooms: BEDROOM_OPTIONS[2],
    furnishing: FURNISHING_OPTIONS[0],
    view: VIEW_OPTIONS[0],
  };
}

export function isMarketAnalysisReady(filters: MarketFilters): boolean {
  return Object.values(filters).every(Boolean);
}
