import type { SearchFiltersInput } from "../schemas/search-filters.schema";
import type { SmartSearchSort } from "../schemas/smart-search.schema";
import type { PropertySearchResult } from "../types";

function primaryPrice(row: PropertySearchResult): number | null {
  return row.askingSale ?? row.askingRent ?? null;
}

function resolvePricePerSqft(row: PropertySearchResult): number | null {
  if (row.pricePerSqft !== null && row.pricePerSqft !== undefined) {
    return row.pricePerSqft;
  }

  const price = primaryPrice(row);
  if (!price || !row.size || row.size <= 0) return null;
  return price / row.size;
}

function relevanceScore(
  row: PropertySearchResult,
  filters: SearchFiltersInput
): number {
  let score = 0;

  if (filters.bedrooms !== undefined && row.bedrooms === filters.bedrooms) {
    score += 12;
  }
  if (filters.propertyType && row.propertyType === filters.propertyType) {
    score += 10;
  }
  if (filters.view && row.view === filters.view) score += 8;
  if (filters.furnishing && row.furnishing === filters.furnishing) score += 6;

  const price = primaryPrice(row);
  if (price !== null) {
    if (filters.maxPrice !== undefined && price <= filters.maxPrice) score += 8;
    if (filters.minPrice !== undefined && price >= filters.minPrice) score += 8;
  }

  const sqftPrice = resolvePricePerSqft(row);
  if (sqftPrice !== null) {
    if (
      filters.maxPricePerSqft !== undefined &&
      sqftPrice <= filters.maxPricePerSqft
    ) {
      score += 8;
    }
    if (
      filters.minPricePerSqft !== undefined &&
      sqftPrice >= filters.minPricePerSqft
    ) {
      score += 8;
    }
  }

  if (row.size !== null) {
    if (filters.maxSize !== undefined && row.size <= filters.maxSize) score += 6;
    if (filters.minSize !== undefined && row.size >= filters.minSize) score += 6;
  }

  if (
    filters.minRoi !== undefined &&
    row.estimatedRoiPercent !== null &&
    row.estimatedRoiPercent >= filters.minRoi
  ) {
    score += 10;
  }

  if (row.estimatedRoiPercent !== null) {
    score += row.estimatedRoiPercent / 10;
  }

  return score;
}

export function applySmartSearchSort(
  rows: PropertySearchResult[],
  sort?: SmartSearchSort,
  filters: SearchFiltersInput = {}
): PropertySearchResult[] {
  if (!sort) return rows;

  const copy = [...rows];

  switch (sort) {
    case "newest":
      return copy.sort(
        (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()
      );
    case "oldest":
      return copy.sort(
        (a, b) => a.lastUpdated.getTime() - b.lastUpdated.getTime()
      );
    case "price_asc":
      return copy.sort(
        (a, b) => (primaryPrice(a) ?? Infinity) - (primaryPrice(b) ?? Infinity)
      );
    case "price_desc":
    case "luxury":
      return copy.sort(
        (a, b) => (primaryPrice(b) ?? 0) - (primaryPrice(a) ?? 0)
      );
    case "price_sqft_asc":
    case "best_value":
      return copy.sort(
        (a, b) =>
          (resolvePricePerSqft(a) ?? Infinity) -
          (resolvePricePerSqft(b) ?? Infinity)
      );
    case "price_sqft_desc":
      return copy.sort(
        (a, b) => (resolvePricePerSqft(b) ?? 0) - (resolvePricePerSqft(a) ?? 0)
      );
    case "roi_desc":
      return copy.sort(
        (a, b) =>
          (b.estimatedRoiPercent ?? -Infinity) -
          (a.estimatedRoiPercent ?? -Infinity)
      );
    case "relevance":
      return copy.sort((a, b) => {
        const scoreDiff = relevanceScore(b, filters) - relevanceScore(a, filters);
        if (scoreDiff !== 0) return scoreDiff;
        return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      });
    default:
      return copy;
  }
}

export function applySmartSearchPostFilters(
  rows: PropertySearchResult[],
  filters: SearchFiltersInput
): PropertySearchResult[] {
  let result = rows;

  if (filters.minRoi !== undefined) {
    result = result.filter(
      (row) =>
        row.estimatedRoiPercent !== null &&
        row.estimatedRoiPercent >= filters.minRoi!
    );
  }

  return result;
}

export function applySmartSearchResults(
  rows: PropertySearchResult[],
  options: {
    sort?: SmartSearchSort;
    filters?: SearchFiltersInput;
    smartQuery?: string;
  }
): PropertySearchResult[] {
  const filters = options.filters ?? {};
  const filtered = applySmartSearchPostFilters(rows, filters);
  const sort =
    options.sort ??
    (options.smartQuery ? ("relevance" as SmartSearchSort) : undefined);

  return applySmartSearchSort(filtered, sort, filters);
}
