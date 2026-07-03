import type { SearchFiltersInput } from "../schemas/search-filters.schema";
import type { SmartSearchSort } from "../schemas/smart-search.schema";
import type { FilterOption } from "../types";

export type DetectedFilter = {
  key: string;
  label: string;
  value: string;
  /** Compact chip text shown in the smart search bar */
  chip?: string;
};

export type SmartSearchParseResult = {
  filters: SearchFiltersInput;
  sort?: SmartSearchSort;
  detected: DetectedFilter[];
  detectedKeys: string[];
  unmatchedTerms: string[];
};

export type SmartSearchContext = {
  communities: FilterOption[];
  buildings: FilterOption[];
};

export const QUICK_SUGGESTIONS = [
  "2 bedroom for sale",
  "studio for rent",
  "sea view apartment for sale",
  "pacific 1 bedroom rent",
  "royal breeze studio for sale",
  "2 bedroom under 1.3 million",
  "Sea view apartments",
  "Furnished apartments for rent",
  "Lowest AED per sqft",
  "Newest listings",
  "Ready to move",
  "Al Hamra villas for sale",
  "below 900k",
  "Marina view for sale",
] as const;

export const AUTOCOMPLETE_STARTERS = [
  "2 bedroom",
  "3 bedroom",
  "Sea view",
  "Marina view",
  "Furnished",
  "Unfurnished",
  "Under 1.3 million",
  "Al Hamra",
  "Royal Breeze",
  "Newest listings",
  "Villas",
  "Studios",
  "Ready to move",
] as const;
