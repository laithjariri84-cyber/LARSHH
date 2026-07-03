import type {
  CreateViewingInput,
  PaginatedResult,
  UpdateViewingInput,
  Viewing,
  ViewingFilterParams,
  ViewingSearchParams,
} from "@/types";
import type {
  ApiCreateHandler,
  ApiDeleteHandler,
  ApiGetHandler,
  ApiListHandler,
  ApiUpdateHandler,
  IApiHandler,
} from "../handler.interface";

export interface IViewingsApi {
  list: ApiListHandler<Record<string, never>, Viewing>;
  getById: ApiGetHandler<Viewing>;
  create: ApiCreateHandler<CreateViewingInput, Viewing>;
  update: ApiUpdateHandler<UpdateViewingInput, Viewing>;
  remove: ApiDeleteHandler;
  search: IApiHandler<ViewingSearchParams, PaginatedResult<Viewing>>;
  filter: IApiHandler<ViewingFilterParams, PaginatedResult<Viewing>>;
  getUpcoming: IApiHandler<{ agentId?: string }, Viewing[]>;
  getToday: IApiHandler<Record<string, never>, Viewing[]>;
  getCalendar: IApiHandler<{ from: string; to: string }, Viewing[]>;
}
