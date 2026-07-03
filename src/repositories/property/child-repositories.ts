import type {
  PropertyListingRecord,
  PropertyOfferRecord,
  PropertyViewingRecord,
} from "@/domain/property";
import type { ListingStatus, ViewingStatus } from "@prisma/client";
import type { DealStatus } from "@prisma/client";

/**
 * Property-scoped listing operations.
 *
 * Decision: Listings are not an aggregate root. They belong to Property.
 * This interface supports targeted writes when loading the full aggregate
 * is unnecessary (e.g. publish listing, record price change).
 *
 * Every method requires propertyId to enforce the aggregate boundary.
 */
export interface IPropertyListingRepository {
  getCurrent(propertyId: string): Promise<PropertyListingRecord | null>;
  getPrevious(
    propertyId: string,
    limit?: number
  ): Promise<PropertyListingRecord[]>;
  create(
    propertyId: string,
    input: Omit<PropertyListingRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<PropertyListingRecord>;
  updateStatus(
    propertyId: string,
    listingId: string,
    status: ListingStatus
  ): Promise<PropertyListingRecord>;
}

/**
 * Property-scoped offers (deals).
 */
export interface IPropertyOfferRepository {
  findByProperty(
    propertyId: string,
    limit?: number
  ): Promise<PropertyOfferRecord[]>;
  create(
    propertyId: string,
    input: Omit<PropertyOfferRecord, "id">
  ): Promise<PropertyOfferRecord>;
  advanceStatus(
    propertyId: string,
    offerId: string,
    status: DealStatus
  ): Promise<PropertyOfferRecord>;
}

/**
 * Property-scoped viewings.
 */
export interface IPropertyViewingRepository {
  findByProperty(
    propertyId: string,
    limit?: number
  ): Promise<PropertyViewingRecord[]>;
  findUpcoming(propertyId?: string): Promise<PropertyViewingRecord[]>;
  create(
    propertyId: string,
    input: Omit<PropertyViewingRecord, "id">
  ): Promise<PropertyViewingRecord>;
  updateStatus(
    propertyId: string,
    viewingId: string,
    status: ViewingStatus
  ): Promise<PropertyViewingRecord>;
}

export type IPropertyChildRepositories = {
  listings: IPropertyListingRepository;
  offers: IPropertyOfferRepository;
  viewings: IPropertyViewingRepository;
};
