import type {
  CreateDealInput,
  Deal,
  DealFilterParams,
  DealSearchParams,
  UpdateDealInput,
} from "@/types";
import type { IBaseRepository } from "@/types/repository";
import type { DealStatus } from "@prisma/client";

/** @deprecated Offers belong to Property aggregate — use IPropertyOfferRepository */
/** Deal repository — transaction pipeline from inquiry to close. */
export interface IDealRepository
  extends IBaseRepository<
    Deal,
    CreateDealInput,
    UpdateDealInput,
    DealFilterParams,
    DealSearchParams
  > {
  findByStatus(status: DealStatus): Promise<Deal[]>;

  updateStatus(id: string, status: DealStatus): Promise<Deal>;
}
