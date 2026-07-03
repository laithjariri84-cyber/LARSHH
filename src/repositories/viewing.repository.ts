import type {
  CreateViewingInput,
  UpdateViewingInput,
  Viewing,
  ViewingFilterParams,
  ViewingSearchParams,
} from "@/types";
import type { IBaseRepository } from "@/types/repository";
import type { ViewingStatus } from "@prisma/client";

/** @deprecated Viewings belong to Property aggregate — use IPropertyViewingRepository */
/** Viewing repository — scheduled property visits. */
export interface IViewingRepository
  extends IBaseRepository<
    Viewing,
    CreateViewingInput,
    UpdateViewingInput,
    ViewingFilterParams,
    ViewingSearchParams
  > {
  findUpcoming(agentId?: string): Promise<Viewing[]>;

  findByDateRange(from: Date, to: Date): Promise<Viewing[]>;

  updateStatus(id: string, status: ViewingStatus): Promise<Viewing>;
}
