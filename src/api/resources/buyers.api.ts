import type {
  Buyer,
  BuyerFilterParams,
  BuyerSearchParams,
  CreateBuyerInput,
  PaginatedResult,
  UpdateBuyerInput,
} from "@/types";
import type {
  ApiCreateHandler,
  ApiDeleteHandler,
  ApiGetHandler,
  ApiListHandler,
  ApiUpdateHandler,
  IApiHandler,
} from "../handler.interface";

export interface IBuyersApi {
  list: ApiListHandler<Record<string, never>, Buyer>;
  getById: ApiGetHandler<Buyer>;
  create: ApiCreateHandler<CreateBuyerInput, Buyer>;
  update: ApiUpdateHandler<UpdateBuyerInput, Buyer>;
  remove: ApiDeleteHandler;
  search: IApiHandler<BuyerSearchParams, PaginatedResult<Buyer>>;
  filter: IApiHandler<BuyerFilterParams, PaginatedResult<Buyer>>;
}
