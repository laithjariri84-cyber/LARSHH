import type {
  Community,
  CommunityFilterParams,
  CommunitySearchParams,
  CreateCommunityInput,
  UpdateCommunityInput,
} from "@/types";
import type { IBaseRepository } from "@/types/repository";

/** Community repository — geographic/market grouping for buildings. */
export interface ICommunityRepository
  extends IBaseRepository<
    Community,
    CreateCommunityInput,
    UpdateCommunityInput,
    CommunityFilterParams,
    CommunitySearchParams
  > {
  findBySlug(slug: string): Promise<Community | null>;
}
