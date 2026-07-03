/**
 * API layer — HTTP route contracts and path constants.
 *
 * Decision: Handler interfaces live in src/api/; Next.js route files in
 * src/app/api/ will implement these thinly in Phase 3 without business logic.
 *
 * Phase 2: interfaces and route map only. No route handlers added.
 */

export { API_ROUTES, API_ROUTE_GROUPS } from "./routes";
export type { IApiHandlerContext, IApiHandler } from "./handler.interface";
export type { IApiRouter } from "./router.interface";

export type { IPropertyAggregateApi, IPropertiesApi } from "./resources/properties.api";
export type { IPropertyNestedApi } from "./resources/property-nested.api";
export type { IListingsApi } from "./resources/listings.api";
export type { ICommunitiesApi } from "./resources/communities.api";
export type { IBuildingsApi } from "./resources/buildings.api";
export type { IAgentsApi } from "./resources/agents.api";
export type { IOwnersApi } from "./resources/owners.api";
export type { IBuyersApi } from "./resources/buyers.api";
export type { ITenantsApi } from "./resources/tenants.api";
export type { IDealsApi } from "./resources/deals.api";
export type { IViewingsApi } from "./resources/viewings.api";

export type { IApiRegistry } from "./api-registry";
