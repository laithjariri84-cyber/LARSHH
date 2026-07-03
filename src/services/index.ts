/**
 * LARSSH Services — Property-centric
 *
 * @see IPropertyDomainService — primary application service
 * @see docs/PROPERTY_DOMAIN.md
 */

export type { IPropertyDomainService } from "./property-domain.service";
export type {
  ICommunityCatalogService,
  IBuildingCatalogService,
  IAgentDirectoryService,
  IOwnerDirectoryService,
  IBuyerDirectoryService,
  ITenantDirectoryService,
  ICatalogServiceRegistry,
} from "./catalog.registry";
export type {
  IServiceRegistry,
  ILegacyServiceRegistry,
} from "./service-registry";

/** @deprecated Use IPropertyDomainService */
export type { IPropertyService } from "./property.service";
/** @deprecated Offers are property-scoped — use IPropertyDomainService.recordOffer */
export type { IDealService } from "./deal.service";
/** @deprecated Viewings are property-scoped — use IPropertyDomainService.scheduleViewing */
export type { IViewingService } from "./viewing.service";
/** @deprecated Listings are part of Property aggregate */
export type { IListingService } from "./listing.service";
