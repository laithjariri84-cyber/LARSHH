import type {
  CreateTenantInput,
  Tenant,
  TenantFilterParams,
  TenantSearchParams,
  UpdateTenantInput,
} from "@/types";
import type { IBaseService } from "./base.service";

/** Tenant domain service. */
export type ITenantService = IBaseService<
  Tenant,
  CreateTenantInput,
  UpdateTenantInput,
  TenantFilterParams,
  TenantSearchParams
>;
