import type {
  Community,
  CommunityFilterParams,
  CommunitySearchParams,
  CreateCommunityInput,
  PaginatedResult,
  UpdateCommunityInput,
} from "@/types";
import type {
  ApiCreateHandler,
  ApiDeleteHandler,
  ApiGetHandler,
  ApiListHandler,
  ApiUpdateHandler,
  IApiHandler,
} from "../handler.interface";

export interface ICommunitiesApi {
  list: ApiListHandler<Record<string, never>, Community>;
  getById: ApiGetHandler<Community>;
  getBySlug: IApiHandler<{ slug: string }, Community>;
  create: ApiCreateHandler<CreateCommunityInput, Community>;
  update: ApiUpdateHandler<UpdateCommunityInput, Community>;
  remove: ApiDeleteHandler;
  search: IApiHandler<CommunitySearchParams, PaginatedResult<Community>>;
  filter: IApiHandler<CommunityFilterParams, PaginatedResult<Community>>;
}
