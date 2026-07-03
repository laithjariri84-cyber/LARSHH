import type {
  PropertyAggregate,
  PropertyAggregatePatch,
  PropertyLoadOptions,
  PropertyLoadProfile,
  PropertySummary,
  CreatePropertyAggregateInput,
} from "@/domain/property";
import type {
  PaginatedResult,
  PropertyFilterParams,
  PropertySearchParams,
} from "@/types";
import type {
  ApiCreateHandler,
  ApiDeleteHandler,
  ApiListHandler,
  ApiUpdateHandler,
  IApiHandler,
} from "../handler.interface";

/**
 * Property Aggregate API — primary REST contract.
 *
 * Decision: All property data flows through this interface. Child resources
 * (listings, offers, viewings) are nested under property routes.
 */
export interface IPropertyAggregateApi {
  list: ApiListHandler<
    { profile?: PropertyLoadProfile },
    PropertySummary
  >;
  getById: IApiHandler<
    { id: string } & PropertyLoadOptions,
    PropertyAggregate
  >;
  getByCode: IApiHandler<
    { code: string } & PropertyLoadOptions,
    PropertyAggregate
  >;
  create: ApiCreateHandler<
    CreatePropertyAggregateInput,
    PropertyAggregate
  >;
  patch: ApiUpdateHandler<
    PropertyAggregatePatch,
    PropertyAggregate
  >;
  remove: ApiDeleteHandler;

  search: IApiHandler<
    PropertySearchParams,
    PaginatedResult<PropertySummary>
  >;
  filter: IApiHandler<
    PropertyFilterParams,
    PaginatedResult<PropertySummary>
  >;
  getComparables: IApiHandler<
    { id: string; limit?: number },
    PropertySummary[]
  >;
  getSimilar: IApiHandler<
    { id: string; limit?: number },
    PropertySummary[]
  >;
  refreshMarket: IApiHandler<{ id: string }, PropertyAggregate>;
  getFilterOptions: IApiHandler<
    Record<string, never>,
    {
      communities: Array<{ id: string; name: string; masterName: string | null }>;
      buildings: Array<{ id: string; name: string; communityId: string }>;
    }
  >;
}

/** @deprecated Use IPropertyAggregateApi with PropertySummary / PropertyAggregate types */
export type IPropertiesApi = IPropertyAggregateApi;
