import type {
  Building,
  BuildingFilterParams,
  BuildingSearchParams,
  CreateBuildingInput,
  ServiceResult,
  UpdateBuildingInput,
} from "@/types";
import type { IBaseService } from "./base.service";

/** Building domain service. */
export interface IBuildingService
  extends IBaseService<
    Building,
    CreateBuildingInput,
    UpdateBuildingInput,
    BuildingFilterParams,
    BuildingSearchParams
  > {
  getByCommunityId(communityId: string): Promise<ServiceResult<Building[]>>;
}
