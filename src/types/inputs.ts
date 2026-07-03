/**
 * Input DTOs for repository create/update operations.
 * Shapes mirror Prisma create/update inputs without importing Prisma in consumers.
 */

import type { CurrencyCode } from "./entities";
import type {
  DealStatus,
  Furnishing,
  ListingStatus,
  ListingType,
  PropertyType,
  ViewingStatus,
  ViewType,
} from "@prisma/client";

export type CreateCommunityInput = {
  name: string;
  slug: string;
  description?: string | null;
  city: string;
  state: string;
  country?: string;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type UpdateCommunityInput = Partial<CreateCommunityInput>;

export type CreateBuildingInput = {
  communityId: string;
  name: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  totalFloors?: number | null;
  yearBuilt?: number | null;
};

export type UpdateBuildingInput = Partial<CreateBuildingInput>;

export type CreatePropertyInput = {
  propertyCode: string;
  buildingId: string;
  ownerId?: string | null;
  unitNumber?: string | null;
  floor?: number | null;
  areaSqft?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  propertyType: PropertyType;
  furnishing?: Furnishing | null;
  view?: ViewType | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type UpdatePropertyInput = Partial<CreatePropertyInput>;

export type CreateListingInput = {
  propertyId: string;
  agentId: string;
  marketingTitle: string;
  description?: string | null;
  askingPrice: number;
  currency?: CurrencyCode;
  listingType: ListingType;
  status?: ListingStatus;
  publishedAt?: Date | string | null;
  expiresAt?: Date | string | null;
  pfExpertReference?: string | null;
  salesforceId?: string | null;
  qualityScore?: number | null;
};

export type UpdateListingInput = Partial<
  Omit<CreateListingInput, "propertyId" | "agentId">
> & {
  soldAt?: Date | string | null;
};

export type CreateAgentInput = {
  email: string;
  fullName: string;
  phone?: string | null;
  profileId?: string | null;
  licenseNumber?: string | null;
  agencyName?: string | null;
};

export type UpdateAgentInput = Partial<CreateAgentInput>;

export type CreateOwnerInput = {
  email: string;
  fullName: string;
  phone?: string | null;
  profileId?: string | null;
};

export type UpdateOwnerInput = Partial<CreateOwnerInput>;

export type CreateBuyerInput = {
  email: string;
  fullName: string;
  phone?: string | null;
  profileId?: string | null;
};

export type UpdateBuyerInput = Partial<CreateBuyerInput>;

export type CreateTenantInput = {
  email: string;
  fullName: string;
  phone?: string | null;
  profileId?: string | null;
};

export type UpdateTenantInput = Partial<CreateTenantInput>;

export type CreateDealInput = {
  listingId: string;
  buyerId: string;
  agentId: string;
  status?: DealStatus;
  offerPrice?: number | null;
  agreedPrice?: number | null;
  currency?: CurrencyCode;
  openedAt?: Date | string;
};

export type UpdateDealInput = Partial<
  Omit<CreateDealInput, "listingId" | "buyerId" | "agentId">
> & {
  closedAt?: Date | string | null;
};

export type CreateViewingInput = {
  listingId: string;
  agentId: string;
  scheduledAt: Date | string;
  buyerId?: string | null;
  tenantId?: string | null;
  durationMinutes?: number;
  status?: ViewingStatus;
  notes?: string | null;
};

export type UpdateViewingInput = Partial<
  Omit<CreateViewingInput, "listingId" | "agentId">
>;

export type CreateOfferInput = {
  propertyId: string;
  listingId: string;
  buyerId: string;
  agentId: string;
  offerPrice: number;
  currency?: CurrencyCode;
  expiresAt?: Date | string | null;
  notes?: string | null;
};

export type UpdateOfferInput = {
  status?: import("@prisma/client").OfferStatus;
  respondedAt?: Date | string | null;
};

export type CreateTaskInput = {
  propertyId?: string | null;
  title: string;
  description?: string | null;
  assigneeUserId?: string | null;
  assigneeAgentId?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  dueAt?: Date | string | null;
  priority?: import("@prisma/client").TaskPriority;
  status?: import("@prisma/client").TaskStatus;
};

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  completedAt?: Date | string | null;
};

export type CreatePriceHistoryInput = {
  propertyId: string;
  listingId?: string | null;
  price: number;
  currency?: CurrencyCode;
  source?: string;
  recordedAt: Date | string;
};
