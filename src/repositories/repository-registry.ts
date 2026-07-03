import type { ICatalogRepositoryRegistry } from "./catalog";
import type {
  IPropertyAggregateRepository,
  IPropertyChildRepositories,
} from "./property";

/**
 * LARSSH Repository Registry — Property-centric.
 *
 * Decision: `property` is the only aggregate repository. All other
 * repositories are either property-scoped child repos or reference catalogs.
 *
 * Migration: Legacy flat registry (properties, listings, deals, viewings as
 * peers) is deprecated. Implementations must route listing/deal/viewing
 * mutations through property-scoped interfaces.
 */
export interface IRepositoryRegistry {
  /** Aggregate root — central persistence boundary */
  readonly property: IPropertyAggregateRepository;

  /** Property-scoped child entity operations */
  readonly propertyChildren: IPropertyChildRepositories;

  /** Reference data directories (not aggregate roots) */
  readonly catalog: ICatalogRepositoryRegistry;
}

/**
 * @deprecated Use IRepositoryRegistry with property-centric layout.
 * Retained for backward compatibility during Phase 2 migration.
 */
export interface ILegacyRepositoryRegistry {
  readonly properties: IPropertyAggregateRepository;
  readonly listings: IPropertyChildRepositories["listings"];
  readonly communities: ICatalogRepositoryRegistry["communities"];
  readonly buildings: ICatalogRepositoryRegistry["buildings"];
  readonly agents: ICatalogRepositoryRegistry["agents"];
  readonly owners: ICatalogRepositoryRegistry["owners"];
  readonly buyers: ICatalogRepositoryRegistry["buyers"];
  readonly tenants: ICatalogRepositoryRegistry["tenants"];
  readonly deals: IPropertyChildRepositories["offers"];
  readonly viewings: IPropertyChildRepositories["viewings"];
}
