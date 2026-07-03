import type {
  Community,
  CommunityFilterParams,
  CommunitySearchParams,
  CreateCommunityInput,
  ServiceResult,
  UpdateCommunityInput,
} from "@/types";
import type { IBaseService } from "./base.service";

/** Community domain service — portfolio geography. */
export interface ICommunityService
  extends IBaseService<
    Community,
    CreateCommunityInput,
    UpdateCommunityInput,
    CommunityFilterParams,
    CommunitySearchParams
  > {
  getBySlug(slug: string): Promise<ServiceResult<Community>>;
}
