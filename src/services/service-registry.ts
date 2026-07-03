import type { IPropertyDomainService } from "./property-domain.service";
import type { ICatalogServiceRegistry } from "./catalog.registry";

/**
 * Application service registry — Property-centric.
 *
 * Decision: IPropertyDomainService is the primary service. Catalog services
 * support admin/CRM actor management. Entity-peer services (IListingService,
 * IDealService as roots) are deprecated.
 */
export interface IServiceRegistry {
  /** Primary domain service — all features connect here */
  readonly property: IPropertyDomainService;

  /** Reference catalog services (communities, agents, owners, …) */
  readonly catalog: ICatalogServiceRegistry;
}

/** @deprecated Flat entity service registry — use property-centric IServiceRegistry */
export interface ILegacyServiceRegistry {
  readonly properties: IPropertyDomainService;
}
