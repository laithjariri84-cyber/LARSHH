import type {
  Furnishing,
  ListingStatus,
  ListingType,
  PropertyType,
  ViewType,
} from "@prisma/client";

export type PropertySearchResult = {
  propertyId: string;
  propertyCode: string;
  community: string;
  building: string;
  unitNumber: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  size: number | null;
  view: ViewType | null;
  furnishing: Furnishing | null;
  askingRent: number | null;
  askingSale: number | null;
  listingType: ListingType | null;
  assignedAgent: string | null;
  status: ListingStatus | null;
  lastUpdated: Date;
  propertyType: PropertyType;
  currency: string;
  pricePerSqft: number | null;
  estimatedRoiPercent: number | null;
};

export type FilterOption = {
  value: string;
  label: string;
};

export type SearchFilterOptions = {
  communities: FilterOption[];
  buildings: FilterOption[];
};

export type ListingRow = PropertySearchResult;
