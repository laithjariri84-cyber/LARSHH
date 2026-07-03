/**
 * Filter and search parameter types per entity.
 * Used by repository.filter() and repository.search().
 */

import type { DateRangeFilter, TextSearchParams } from "./common";
import type {
  DealStatus,
  Furnishing,
  ListingStatus,
  ListingType,
  PropertyType,
  ViewingStatus,
  ViewType,
} from "@prisma/client";

export type CommunityFilterParams = {
  city?: string;
  state?: string;
  country?: string;
  slug?: string;
};

export type CommunitySearchParams = TextSearchParams;

export type BuildingFilterParams = {
  communityId?: string;
  city?: string;
  state?: string;
  name?: string;
};

export type BuildingSearchParams = TextSearchParams & {
  communityId?: string;
};

export type PropertyFilterParams = {
  buildingId?: string;
  communityId?: string;
  ownerId?: string;
  propertyType?: PropertyType;
  furnishing?: Furnishing;
  view?: ViewType;
  bedrooms?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  bathrooms?: number;
  minAreaSqft?: number;
  maxAreaSqft?: number;
};

export type PropertySearchParams = TextSearchParams & PropertyFilterParams;

export type ListingFilterParams = {
  propertyId?: string;
  agentId?: string;
  listingType?: ListingType;
  status?: ListingStatus;
  minPrice?: number;
  maxPrice?: number;
  publishedAt?: DateRangeFilter;
};

export type ListingSearchParams = TextSearchParams & ListingFilterParams;

export type AgentFilterParams = {
  agencyName?: string;
  hasProfile?: boolean;
};

export type AgentSearchParams = TextSearchParams & AgentFilterParams;

export type OwnerFilterParams = {
  hasProfile?: boolean;
};

export type OwnerSearchParams = TextSearchParams & OwnerFilterParams;

export type BuyerFilterParams = {
  hasProfile?: boolean;
};

export type BuyerSearchParams = TextSearchParams & BuyerFilterParams;

export type TenantFilterParams = {
  hasProfile?: boolean;
};

export type TenantSearchParams = TextSearchParams & TenantFilterParams;

export type DealFilterParams = {
  listingId?: string;
  buyerId?: string;
  agentId?: string;
  status?: DealStatus;
  openedAt?: DateRangeFilter;
  closedAt?: DateRangeFilter;
  minOfferPrice?: number;
  maxOfferPrice?: number;
};

export type DealSearchParams = TextSearchParams & DealFilterParams;

export type ViewingFilterParams = {
  listingId?: string;
  agentId?: string;
  buyerId?: string;
  tenantId?: string;
  status?: ViewingStatus;
  scheduledAt?: DateRangeFilter;
};

export type ViewingSearchParams = TextSearchParams & ViewingFilterParams;
