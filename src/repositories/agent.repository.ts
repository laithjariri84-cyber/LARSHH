import type {
  Agent,
  AgentFilterParams,
  AgentSearchParams,
  CreateAgentInput,
  UpdateAgentInput,
} from "@/types";
import type { IBaseRepository } from "@/types/repository";

/** Agent repository — licensed representatives assigned to listings and deals. */
export interface IAgentRepository
  extends IBaseRepository<
    Agent,
    CreateAgentInput,
    UpdateAgentInput,
    AgentFilterParams,
    AgentSearchParams
  > {
  findByEmail(email: string): Promise<Agent | null>;
}
