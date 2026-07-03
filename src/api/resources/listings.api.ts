import type {
  CreateListingInput,
  Listing,
  ListingFilterParams,
  ListingSearchParams,
  PaginatedResult,
  UpdateListingInput,
} from "@/types";
import type {
  ApiCreateHandler,
  ApiDeleteHandler,
  ApiGetHandler,
  ApiListHandler,
  ApiUpdateHandler,
  IApiHandler,
} from "../handler.interface";

export interface IListingsApi {
  list: ApiListHandler<Record<string, never>, Listing>;
  getById: ApiGetHandler<Listing>;
  create: ApiCreateHandler<CreateListingInput, Listing>;
  update: ApiUpdateHandler<UpdateListingInput, Listing>;
  remove: ApiDeleteHandler;
  search: IApiHandler<ListingSearchParams, PaginatedResult<Listing>>;
  filter: IApiHandler<ListingFilterParams, PaginatedResult<Listing>>;
  publish: IApiHandler<{ id: string }, Listing>;
  withdraw: IApiHandler<{ id: string }, Listing>;
}
