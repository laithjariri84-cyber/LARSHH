import type {
  CreateDealInput,
  Deal,
  DealFilterParams,
  DealSearchParams,
  ServiceResult,
  UpdateDealInput,
} from "@/types";
import type { IBaseService } from "./base.service";
import type { DealStatus } from "@prisma/client";

/** Deal domain service — transaction pipeline orchestration. */
export interface IDealService
  extends IBaseService<
    Deal,
    CreateDealInput,
    UpdateDealInput,
    DealFilterParams,
    DealSearchParams
  > {
  advanceStatus(id: string, status: DealStatus): Promise<ServiceResult<Deal>>;
  getPipelineSummary(): Promise<
    ServiceResult<Record<DealStatus, number>>
  >;
}
