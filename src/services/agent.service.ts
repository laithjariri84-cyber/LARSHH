import type {
  Agent,
  AgentFilterParams,
  AgentSearchParams,
  CreateAgentInput,
  ServiceResult,
  UpdateAgentInput,
} from "@/types";
import type { IBaseService } from "./base.service";

/** Agent domain service. */
export interface IAgentService
  extends IBaseService<
    Agent,
    CreateAgentInput,
    UpdateAgentInput,
    AgentFilterParams,
    AgentSearchParams
  > {
  getByEmail(email: string): Promise<ServiceResult<Agent>>;
  getActiveListings(agentId: string): Promise<ServiceResult<number>>;
}
