import type {
  CreateListingInput,
  Listing,
  ListingFilterParams,
  ListingSearchParams,
  ServiceResult,
  UpdateListingInput,
} from "@/types";
import type { IBaseService } from "./base.service";

/** Listing domain service — market offer lifecycle. */
export interface IListingService
  extends IBaseService<
    Listing,
    CreateListingInput,
    UpdateListingInput,
    ListingFilterParams,
    ListingSearchParams
  > {
  publish(id: string): Promise<ServiceResult<Listing>>;
  withdraw(id: string): Promise<ServiceResult<Listing>>;
  markSold(id: string, soldAt?: Date): Promise<ServiceResult<Listing>>;
  getByPropertyId(propertyId: string): Promise<ServiceResult<Listing[]>>;
}
