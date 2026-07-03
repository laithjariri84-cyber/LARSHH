import type {
  CreatePropertyAggregateInput,
  PropertyAggregate,
  PropertyAggregatePatch,
  PropertyLoadOptions,
  PropertyLoadProfile,
  PropertySummary,
} from "@/domain/property";
import type {
  PaginatedResult,
  PropertyFilterParams,
  PropertySearchParams,
  ServiceResult,
} from "@/types";
import type { RepositoryQueryParams } from "@/types/repository";

/**
 * Property Domain Service — the single application entry point for Property.
 *
 * Decision: Every feature module (Search, Intelligence, CRM, Reports) calls
 * this service — never repositories directly. The service enforces:
 * - Authorization (owner PII, document access)
 * - Aggregate invariants (listing belongs to property, version conflicts)
 * - Load profile selection (summary vs detail vs intelligence)
 * - Mapping to feature view models (via feature mappers)
 *
 * This replaces the flat IPropertyService + scattered entity services for
 * property-scoped operations.
 */
export interface IPropertyDomainService {
  // ─── Aggregate access ────────────────────────────────────────────────

  create(
    input: CreatePropertyAggregateInput
  ): Promise<ServiceResult<PropertyAggregate>>;

  getById(
    propertyId: string,
    options?: PropertyLoadOptions
  ): Promise<ServiceResult<PropertyAggregate>>;

  getByCode(
    propertyCode: string,
    options?: PropertyLoadOptions
  ): Promise<ServiceResult<PropertyAggregate>>;

  getByProfile(
    propertyId: string,
    profile: PropertyLoadProfile
  ): Promise<ServiceResult<PropertyAggregate>>;

  update(
    propertyId: string,
    patch: PropertyAggregatePatch
  ): Promise<ServiceResult<PropertyAggregate>>;

  remove(propertyId: string): Promise<ServiceResult<void>>;

  // ─── Discovery (always returns summaries) ──────────────────────────

  search(
    params: PropertySearchParams,
    query?: RepositoryQueryParams
  ): Promise<ServiceResult<PaginatedResult<PropertySummary>>>;

  filter(
    params: PropertyFilterParams,
    query?: RepositoryQueryParams
  ): Promise<ServiceResult<PaginatedResult<PropertySummary>>>;

  list(
    query?: RepositoryQueryParams
  ): Promise<ServiceResult<PaginatedResult<PropertySummary>>>;

  // ─── Intelligence ──────────────────────────────────────────────────

  getComparables(
    propertyId: string,
    limit?: number
  ): Promise<ServiceResult<PropertySummary[]>>;

  getSimilar(
    propertyId: string,
    limit?: number
  ): Promise<ServiceResult<PropertySummary[]>>;

  refreshMarketIntelligence(
    propertyId: string
  ): Promise<ServiceResult<PropertyAggregate>>;

  getSearchFilterOptions(): Promise<
    ServiceResult<{
      communities: Array<{ id: string; name: string; masterName: string | null }>;
      buildings: Array<{ id: string; name: string; communityId: string }>;
    }>
  >;

  // ─── Property-scoped workflow (CRM connects here) ──────────────────

  scheduleViewing(
    propertyId: string,
    input: unknown
  ): Promise<ServiceResult<PropertyAggregate>>;

  recordOffer(
    propertyId: string,
    input: unknown
  ): Promise<ServiceResult<PropertyAggregate>>;

  addNote(
    propertyId: string,
    body: string
  ): Promise<ServiceResult<PropertyAggregate>>;
}
