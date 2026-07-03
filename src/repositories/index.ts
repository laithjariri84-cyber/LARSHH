/**
 * LARSSH Repositories — Property-centric architecture
 *
 * The Property aggregate is the sole persistence boundary for inventory,
 * market data, media, and property-scoped workflow.
 *
 * @see docs/PROPERTY_DOMAIN.md
 * @see src/domain/property/
 */

// ─── Aggregate root ───────────────────────────────────────────────────────────
export type { IPropertyAggregateRepository } from "./property/aggregate.repository";
export type {
  IPropertyListingRepository,
  IPropertyOfferRepository,
  IPropertyViewingRepository,
  IPropertyChildRepositories,
} from "./property/child-repositories";

// ─── Reference catalogs (not aggregate roots) ────────────────────────────────
export type {
  ICommunityCatalogRepository,
  IBuildingCatalogRepository,
  IAgentDirectoryRepository,
  IOwnerDirectoryRepository,
  IBuyerDirectoryRepository,
  ITenantDirectoryRepository,
  ICatalogRepositoryRegistry,
} from "./catalog/catalog.registry";

// ─── Registry ────────────────────────────────────────────────────────────────
export type {
  IRepositoryRegistry,
  ILegacyRepositoryRegistry,
} from "./repository-registry";

// ─── Legacy entity repositories (deprecated — migrate to property-centric) ───
/** @deprecated Use IPropertyAggregateRepository */
export type { IPropertyRepository } from "./property.repository";
/** @deprecated Use IPropertyListingRepository with propertyId scope */
export type { IListingRepository } from "./listing.repository";
/** @deprecated Use IPropertyOfferRepository with propertyId scope */
export type { IDealRepository } from "./deal.repository";
/** @deprecated Use IPropertyViewingRepository with propertyId scope */
export type { IViewingRepository } from "./viewing.repository";
/** @deprecated Use ICommunityCatalogRepository */
export type { ICommunityRepository } from "./community.repository";
/** @deprecated Use IBuildingCatalogRepository */
export type { IBuildingRepository } from "./building.repository";
/** @deprecated Use IAgentDirectoryRepository */
export type { IAgentRepository } from "./agent.repository";
/** @deprecated Use IOwnerDirectoryRepository */
export type { IOwnerRepository } from "./owner.repository";
/** @deprecated Use IBuyerDirectoryRepository */
export type { IBuyerRepository } from "./buyer.repository";
/** @deprecated Use ITenantDirectoryRepository */
export type { ITenantRepository } from "./tenant.repository";

export type { IBaseRepository, RepositoryQueryParams } from "@/types/repository";
