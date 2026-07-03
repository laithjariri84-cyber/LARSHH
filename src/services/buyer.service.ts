import type {
  Buyer,
  BuyerFilterParams,
  BuyerSearchParams,
  CreateBuyerInput,
  ServiceResult,
  UpdateBuyerInput,
} from "@/types";
import type { IBaseService } from "./base.service";

/** Buyer domain service. */
export type IBuyerService = IBaseService<
  Buyer,
  CreateBuyerInput,
  UpdateBuyerInput,
  BuyerFilterParams,
  BuyerSearchParams
>;
