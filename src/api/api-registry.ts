import type { IAgentsApi } from "./resources/agents.api";
import type { IBuildingsApi } from "./resources/buildings.api";
import type { IBuyersApi } from "./resources/buyers.api";
import type { ICommunitiesApi } from "./resources/communities.api";
import type { IDealsApi } from "./resources/deals.api";
import type { IListingsApi } from "./resources/listings.api";
import type { IOwnersApi } from "./resources/owners.api";
import type { IPropertyAggregateApi } from "./resources/properties.api";
import type { IPropertyNestedApi } from "./resources/property-nested.api";
import type { ITenantsApi } from "./resources/tenants.api";
import type { IViewingsApi } from "./resources/viewings.api";

/**
 * API registry — Property-centric.
 *
 * `property` is the primary resource. `propertyNested` holds child endpoints.
 * Legacy flat resources retained for backward compatibility during migration.
 */
export interface IApiRegistry {
  /** Primary aggregate API */
  readonly property: IPropertyAggregateApi;

  /** Nested property-scoped child APIs */
  readonly propertyNested: IPropertyNestedApi;

  /** Reference catalog APIs */
  readonly communities: ICommunitiesApi;
  readonly buildings: IBuildingsApi;
  readonly agents: IAgentsApi;
  readonly owners: IOwnersApi;
  readonly buyers: IBuyersApi;
  readonly tenants: ITenantsApi;

  /** @deprecated Use propertyNested */
  readonly properties: IPropertyAggregateApi;
  /** @deprecated Use propertyNested.listings */
  readonly listings: IListingsApi;
  /** @deprecated Use propertyNested.offers */
  readonly deals: IDealsApi;
  /** @deprecated Use propertyNested.viewings */
  readonly viewings: IViewingsApi;
}
