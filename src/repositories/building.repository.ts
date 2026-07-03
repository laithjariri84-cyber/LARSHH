import type {
  Building,
  BuildingFilterParams,
  BuildingSearchParams,
  CreateBuildingInput,
  UpdateBuildingInput,
} from "@/types";
import type { IBaseRepository } from "@/types/repository";

/** Building repository — physical structures within communities. */
export interface IBuildingRepository
  extends IBaseRepository<
    Building,
    CreateBuildingInput,
    UpdateBuildingInput,
    BuildingFilterParams,
    BuildingSearchParams
  > {
  findByCommunityId(communityId: string): Promise<Building[]>;
}
