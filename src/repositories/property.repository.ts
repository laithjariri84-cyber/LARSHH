/**
 * @deprecated Use IPropertyAggregateRepository from `@/repositories/property/aggregate.repository`.
 *
 * This interface mapped Property as a flat entity. LARSSH now treats Property
 * as an aggregate root. Migrate callers to IPropertyAggregateRepository.load/save.
 */
import type {
  CreatePropertyInput,
  Property,
  PropertyFilterParams,
  PropertySearchParams,
  UpdatePropertyInput,
} from "@/types";
import type { IBaseRepository } from "@/types/repository";

/** @deprecated */
export interface IPropertyRepository
  extends IBaseRepository<
    Property,
    CreatePropertyInput,
    UpdatePropertyInput,
    PropertyFilterParams,
    PropertySearchParams
  > {
  findSimilar(propertyId: string, limit?: number): Promise<Property[]>;
  getFilterOptions(): Promise<{
    communities: Array<{ id: string; name: string }>;
    buildings: Array<{ id: string; name: string; communityId: string }>;
  }>;
}

/** @deprecated Alias — use IPropertyAggregateRepository */
export type { IPropertyAggregateRepository as IPropertyRepositoryV2 } from "./property/aggregate.repository";
