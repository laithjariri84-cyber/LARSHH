import type {
  CreateDealInput,
  Deal,
  DealFilterParams,
  DealSearchParams,
  PaginatedResult,
  UpdateDealInput,
} from "@/types";
import type { DealStatus } from "@prisma/client";
import type {
  ApiCreateHandler,
  ApiDeleteHandler,
  ApiGetHandler,
  ApiListHandler,
  ApiUpdateHandler,
  IApiHandler,
} from "../handler.interface";

export interface IDealsApi {
  list: ApiListHandler<Record<string, never>, Deal>;
  getById: ApiGetHandler<Deal>;
  create: ApiCreateHandler<CreateDealInput, Deal>;
  update: ApiUpdateHandler<UpdateDealInput, Deal>;
  remove: ApiDeleteHandler;
  search: IApiHandler<DealSearchParams, PaginatedResult<Deal>>;
  filter: IApiHandler<DealFilterParams, PaginatedResult<Deal>>;
  getPipeline: IApiHandler<Record<string, never>, Record<DealStatus, number>>;
  advance: IApiHandler<{ id: string; status: DealStatus }, Deal>;
}
