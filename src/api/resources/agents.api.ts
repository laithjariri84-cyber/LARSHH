import type {
  Agent,
  AgentFilterParams,
  AgentSearchParams,
  CreateAgentInput,
  PaginatedResult,
  UpdateAgentInput,
} from "@/types";
import type {
  ApiCreateHandler,
  ApiDeleteHandler,
  ApiGetHandler,
  ApiListHandler,
  ApiUpdateHandler,
  IApiHandler,
} from "../handler.interface";

export interface IAgentsApi {
  list: ApiListHandler<Record<string, never>, Agent>;
  getById: ApiGetHandler<Agent>;
  create: ApiCreateHandler<CreateAgentInput, Agent>;
  update: ApiUpdateHandler<UpdateAgentInput, Agent>;
  remove: ApiDeleteHandler;
  search: IApiHandler<AgentSearchParams, PaginatedResult<Agent>>;
  filter: IApiHandler<AgentFilterParams, PaginatedResult<Agent>>;
}
