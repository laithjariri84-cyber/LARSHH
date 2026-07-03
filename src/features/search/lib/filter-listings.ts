import type { ListingSearchRecord } from "../data/mock-listings-search";

export type ListingsSearchFilters = {
  query: string;
  community: string;
  purpose: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  furnished: string;
  status: string;
};

export const defaultListingsSearchFilters: ListingsSearchFilters = {
  query: "",
  community: "",
  purpose: "",
  propertyType: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  bathrooms: "",
  furnished: "",
  status: "",
};

export function filterListings(
  listings: ListingSearchRecord[],
  filters: ListingsSearchFilters
): ListingSearchRecord[] {
  const q = filters.query.trim().toLowerCase();

  return listings.filter((listing) => {
    if (q) {
      const haystack = [
        listing.propertyCode,
        listing.community,
        listing.owner,
        listing.agent,
        listing.propertyType,
        listing.purpose,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (filters.community && listing.community !== filters.community) return false;
    if (filters.purpose && listing.purpose !== filters.purpose) return false;
    if (filters.propertyType && listing.propertyType !== filters.propertyType)
      return false;
    if (filters.furnished && listing.furnished !== filters.furnished) return false;
    if (filters.status && listing.status !== filters.status) return false;

    if (filters.bedrooms) {
      if (listing.bedrooms !== Number(filters.bedrooms)) return false;
    }

    if (filters.bathrooms && listing.bathrooms !== Number(filters.bathrooms))
      return false;

    if (filters.minPrice && listing.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && listing.price > Number(filters.maxPrice)) return false;

    return true;
  });
}
