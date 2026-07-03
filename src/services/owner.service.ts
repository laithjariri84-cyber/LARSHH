import type {
  CreateOwnerInput,
  Owner,
  OwnerFilterParams,
  OwnerSearchParams,
  ServiceResult,
  UpdateOwnerInput,
} from "@/types";
import type { IBaseService } from "./base.service";

/** Owner domain service. */
export interface IOwnerService
  extends IBaseService<
    Owner,
    CreateOwnerInput,
    UpdateOwnerInput,
    OwnerFilterParams,
    OwnerSearchParams
  > {
  getPortfolio(ownerId: string): Promise<ServiceResult<string[]>>;
}
