export {
  getAllProperties,
  searchProperties,
  getCommunityOptions,
  getBuildingOptions,
  getPropertyById,
} from "./services/search-properties";
export type {
  PropertySearchResult,
  FilterOption,
  SearchFilterOptions,
  ListingRow,
} from "./types";
export {
  searchFiltersSchema,
  searchFiltersDefaults,
} from "./schemas/search-filters.schema";
export type { SearchFiltersInput } from "./schemas/search-filters.schema";
