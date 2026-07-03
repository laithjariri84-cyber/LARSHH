import type {
  CreatePropertyInput,
  PaginatedResult,
  PaginationParams,
  Property,
  PropertyFilterParams,
  PropertySearchParams,
  ServiceResult,
  SortParams,
  UpdatePropertyInput,
} from "@/types";
import type { IBaseService } from "./base.service";

/** @deprecated Use IPropertyDomainService — Property is the aggregate root */
export interface IPropertyService
  extends IBaseService<
    Property,
    CreatePropertyInput,
    UpdatePropertyInput,
    PropertyFilterParams,
    PropertySearchParams
  > {
  getSimilar(propertyId: string, limit?: number): Promise<ServiceResult<Property[]>>;

  getSearchFilterOptions(): Promise<
    ServiceResult<{
      communities: Array<{ id: string; name: string }>;
      buildings: Array<{ id: string; name: string; communityId: string }>;
    }>
  >;
}

export type PropertyServiceListParams = PaginationParams & SortParams;
export type PropertyServiceSearchResult = ServiceResult<PaginatedResult<Property>>;
