import type {
  CreateViewingInput,
  ServiceResult,
  UpdateViewingInput,
  Viewing,
  ViewingFilterParams,
  ViewingSearchParams,
} from "@/types";
import type { IBaseService } from "./base.service";

/** Viewing domain service — scheduling and notes. */
export interface IViewingService
  extends IBaseService<
    Viewing,
    CreateViewingInput,
    UpdateViewingInput,
    ViewingFilterParams,
    ViewingSearchParams
  > {
  getUpcoming(agentId?: string): Promise<ServiceResult<Viewing[]>>;
  getToday(): Promise<ServiceResult<Viewing[]>>;
  getCalendar(from: Date, to: Date): Promise<ServiceResult<Viewing[]>>;
}
