import type {
  Building,
  BuildingFilterParams,
  BuildingSearchParams,
  CreateBuildingInput,
  PaginatedResult,
  UpdateBuildingInput,
} from "@/types";
import type {
  ApiCreateHandler,
  ApiDeleteHandler,
  ApiGetHandler,
  ApiListHandler,
  ApiUpdateHandler,
  IApiHandler,
} from "../handler.interface";

export interface IBuildingsApi {
  list: ApiListHandler<Record<string, never>, Building>;
  getById: ApiGetHandler<Building>;
  create: ApiCreateHandler<CreateBuildingInput, Building>;
  update: ApiUpdateHandler<UpdateBuildingInput, Building>;
  remove: ApiDeleteHandler;
  search: IApiHandler<BuildingSearchParams, PaginatedResult<Building>>;
  filter: IApiHandler<BuildingFilterParams, PaginatedResult<Building>>;
  getByCommunityId: IApiHandler<{ communityId: string }, Building[]>;
}
