import type {
  CreateTenantInput,
  PaginatedResult,
  Tenant,
  TenantFilterParams,
  TenantSearchParams,
  UpdateTenantInput,
} from "@/types";
import type {
  ApiCreateHandler,
  ApiDeleteHandler,
  ApiGetHandler,
  ApiListHandler,
  ApiUpdateHandler,
  IApiHandler,
} from "../handler.interface";

export interface ITenantsApi {
  list: ApiListHandler<Record<string, never>, Tenant>;
  getById: ApiGetHandler<Tenant>;
  create: ApiCreateHandler<CreateTenantInput, Tenant>;
  update: ApiUpdateHandler<UpdateTenantInput, Tenant>;
  remove: ApiDeleteHandler;
  search: IApiHandler<TenantSearchParams, PaginatedResult<Tenant>>;
  filter: IApiHandler<TenantFilterParams, PaginatedResult<Tenant>>;
}
