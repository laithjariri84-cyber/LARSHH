import type {
  Buyer,
  BuyerFilterParams,
  BuyerSearchParams,
  CreateBuyerInput,
  UpdateBuyerInput,
} from "@/types";
import type { IBaseRepository } from "@/types/repository";

/** Buyer repository — purchase-side clients for deals and viewings. */
export interface IBuyerRepository
  extends IBaseRepository<
    Buyer,
    CreateBuyerInput,
    UpdateBuyerInput,
    BuyerFilterParams,
    BuyerSearchParams
  > {
  findByEmail(email: string): Promise<Buyer | null>;
}
