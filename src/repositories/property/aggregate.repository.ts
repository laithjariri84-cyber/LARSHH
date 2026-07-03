import type {
  CreatePropertyAggregateInput,
  PropertyAggregate,
  PropertyAggregatePatch,
  PropertyLoadOptions,
  PropertySummary,
} from "@/domain/property";
import type {
  PaginatedResult,
  PropertyFilterParams,
  PropertySearchParams,
  RepositoryQueryParams,
} from "@/types";

/**
 * Property Aggregate Repository — the central persistence boundary of LARSSH.
 *
 * Decision: One repository owns the Property aggregate root. All features
 * ultimately call this interface. Child collections (listings, viewings, photos)
 * are loaded and persisted as part of aggregate operations — not through
 * independent aggregate roots.
 *
 * Scale: Use PropertyLoadOptions to hydrate only required sections.
 * Search/list endpoints return PropertySummary — never full aggregates.
 */
export interface IPropertyAggregateRepository {
  // ─── Aggregate lifecycle ─────────────────────────────────────────────

  /** Create a new property with core identity, location, specification, owner link. */
  create(input: CreatePropertyAggregateInput): Promise<PropertyAggregate>;

  /**
   * Load property aggregate with selective section hydration.
   * Returns null if property does not exist or is soft-deleted.
   */
  load(
    propertyId: string,
    options?: PropertyLoadOptions
  ): Promise<PropertyAggregate | null>;

  /**
   * Load by business key (property code) — used by search and integrations.
   */
  loadByCode(
    propertyCode: string,
    options?: PropertyLoadOptions
  ): Promise<PropertyAggregate | null>;

  /**
   * Persist aggregate changes. Enforces optimistic locking via version.
   * Only mutates sections present in loadedSections unless full save flagged.
   */
  save(aggregate: PropertyAggregate): Promise<PropertyAggregate>;

  /** Apply partial patch without requiring full aggregate in memory. */
  patch(propertyId: string, patch: PropertyAggregatePatch): Promise<PropertyAggregate>;

  /** Soft-delete property and cascade withdraw active listings. */
  delete(propertyId: string): Promise<void>;

  // ─── Search & discovery (summary projections) ───────────────────────

  /** Full-text and structured search — returns summaries, not full aggregates. */
  search(
    params: PropertySearchParams,
    query?: RepositoryQueryParams
  ): Promise<PaginatedResult<PropertySummary>>;

  /** Structured filter — returns summaries. */
  filter(
    params: PropertyFilterParams,
    query?: RepositoryQueryParams
  ): Promise<PaginatedResult<PropertySummary>>;

  /** Paginated list for admin and export. */
  findMany(
    query?: RepositoryQueryParams
  ): Promise<PaginatedResult<PropertySummary>>;

  // ─── Property-scoped intelligence ───────────────────────────────────

  /** Comparable properties for intelligence modules. */
  findComparables(
    propertyId: string,
    limit?: number
  ): Promise<PropertySummary[]>;

  /** Similar properties by building, type, and bedroom profile. */
  findSimilar(
    propertyId: string,
    limit?: number
  ): Promise<PropertySummary[]>;

  /** Filter dropdown options derived from property index. */
  getSearchFilterOptions(): Promise<{
    communities: Array<{ id: string; name: string; masterName: string | null }>;
    buildings: Array<{ id: string; name: string; communityId: string }>;
  }>;

  // ─── Section-specific commands (avoid full aggregate load) ─────────

  /** Recompute and persist market statistics + ROI for one property. */
  refreshMarketData(propertyId: string): Promise<void>;

  /** Rebuild comparables for one property from search index. */
  refreshComparables(propertyId: string): Promise<void>;

  /** Reindex property in search read model. */
  reindex(propertyId: string): Promise<void>;
}
