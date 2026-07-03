import type {
  CreateOwnerInput,
  Owner,
  OwnerFilterParams,
  OwnerSearchParams,
  PaginatedResult,
  UpdateOwnerInput,
} from "@/types";
import type {
  ApiCreateHandler,
  ApiDeleteHandler,
  ApiGetHandler,
  ApiListHandler,
  ApiUpdateHandler,
  IApiHandler,
} from "../handler.interface";

export interface IOwnersApi {
  list: ApiListHandler<Record<string, never>, Owner>;
  getById: ApiGetHandler<Owner>;
  create: ApiCreateHandler<CreateOwnerInput, Owner>;
  update: ApiUpdateHandler<UpdateOwnerInput, Owner>;
  remove: ApiDeleteHandler;
  search: IApiHandler<OwnerSearchParams, PaginatedResult<Owner>>;
  filter: IApiHandler<OwnerFilterParams, PaginatedResult<Owner>>;
  getPortfolio: IApiHandler<{ id: string }, string[]>;
}
