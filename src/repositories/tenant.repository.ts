import type {
  CreateTenantInput,
  Tenant,
  TenantFilterParams,
  TenantSearchParams,
  UpdateTenantInput,
} from "@/types";
import type { IBaseRepository } from "@/types/repository";

/** Tenant repository — rental-side clients for viewings. */
export interface ITenantRepository
  extends IBaseRepository<
    Tenant,
    CreateTenantInput,
    UpdateTenantInput,
    TenantFilterParams,
    TenantSearchParams
  > {
  findByEmail(email: string): Promise<Tenant | null>;
}
