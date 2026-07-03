import type { PropertyListingRecord, PropertyOfferRecord, PropertyViewingRecord } from "@/domain/property";
import type { IApiHandler } from "../handler.interface";

/**
 * Property-nested child resource APIs.
 *
 * Decision: Offers, viewings, and listings are not top-level REST roots.
 * Every mutation requires propertyId in the path.
 */
export interface IPropertyListingsApi {
  list: IApiHandler<{ propertyId: string }, PropertyListingRecord[]>;
  getCurrent: IApiHandler<{ propertyId: string }, PropertyListingRecord | null>;
  create: IApiHandler<
    { propertyId: string; input: Omit<PropertyListingRecord, "id" | "createdAt" | "updatedAt"> },
    PropertyListingRecord
  >;
}

export interface IPropertyOffersApi {
  list: IApiHandler<{ propertyId: string; limit?: number }, PropertyOfferRecord[]>;
  create: IApiHandler<
    { propertyId: string; input: Omit<PropertyOfferRecord, "id"> },
    PropertyOfferRecord
  >;
}

export interface IPropertyViewingsApi {
  list: IApiHandler<{ propertyId: string; limit?: number }, PropertyViewingRecord[]>;
  create: IApiHandler<
    { propertyId: string; input: Omit<PropertyViewingRecord, "id"> },
    PropertyViewingRecord
  >;
  upcoming: IApiHandler<{ propertyId?: string }, PropertyViewingRecord[]>;
}

export type IPropertyNestedApi = {
  listings: IPropertyListingsApi;
  offers: IPropertyOffersApi;
  viewings: IPropertyViewingsApi;
};
