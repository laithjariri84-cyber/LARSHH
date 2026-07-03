import type { PaginatedResult, RepositoryQueryParams } from "@/types";
import type { IBaseRepository } from "@/types/repository";
import type {
  CreateListingInput,
  Listing,
  ListingFilterParams,
  ListingSearchParams,
  UpdateListingInput,
} from "@/types";

/** @deprecated Listings belong to Property aggregate — use IPropertyListingRepository */
/** Listing repository — active market offers linked to properties and agents. */
export interface IListingRepository
  extends IBaseRepository<
    Listing,
    CreateListingInput,
    UpdateListingInput,
    ListingFilterParams,
    ListingSearchParams
  > {
  findByPropertyId(
    propertyId: string,
    query?: RepositoryQueryParams
  ): Promise<PaginatedResult<Listing>>;

  findActiveByAgentId(agentId: string): Promise<Listing[]>;
}
