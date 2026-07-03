import type {
  CreateOwnerInput,
  Owner,
  OwnerFilterParams,
  OwnerSearchParams,
  UpdateOwnerInput,
} from "@/types";
import type { IBaseRepository } from "@/types/repository";

/** Owner repository — property ownership records. */
export interface IOwnerRepository
  extends IBaseRepository<
    Owner,
    CreateOwnerInput,
    UpdateOwnerInput,
    OwnerFilterParams,
    OwnerSearchParams
  > {
  findByEmail(email: string): Promise<Owner | null>;

  findProperties(ownerId: string): Promise<string[]>;
}
