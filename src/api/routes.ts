/**
 * REST route path constants — Property-centric layout.
 *
 * Primary resource: /api/v1/properties
 * Child resources nested under /api/v1/properties/:propertyId/*
 *
 * Legacy top-level routes (/deals, /viewings, /listings) are deprecated.
 */
export const API_ROUTE_GROUPS = {
  properties: "/api/v1/properties",
  /** @deprecated Use nested property routes */
  listings: "/api/v1/listings",
  communities: "/api/v1/communities",
  buildings: "/api/v1/buildings",
  agents: "/api/v1/agents",
  owners: "/api/v1/owners",
  buyers: "/api/v1/buyers",
  tenants: "/api/v1/tenants",
  /** @deprecated Use /properties/:id/offers */
  deals: "/api/v1/deals",
  /** @deprecated Use /properties/:id/viewings */
  viewings: "/api/v1/viewings",
} as const;

export const API_ROUTES = {
  properties: {
    list: API_ROUTE_GROUPS.properties,
    byId: (id: string) => `${API_ROUTE_GROUPS.properties}/${id}`,
    byCode: (code: string) => `${API_ROUTE_GROUPS.properties}/code/${code}`,
    search: `${API_ROUTE_GROUPS.properties}/search`,
    filter: `${API_ROUTE_GROUPS.properties}/filter`,
    comparables: (id: string) => `${API_ROUTE_GROUPS.properties}/${id}/comparables`,
    similar: (id: string) => `${API_ROUTE_GROUPS.properties}/${id}/similar`,
    refreshMarket: (id: string) => `${API_ROUTE_GROUPS.properties}/${id}/market/refresh`,
    filterOptions: `${API_ROUTE_GROUPS.properties}/filter-options`,
    listings: (propertyId: string) =>
      `${API_ROUTE_GROUPS.properties}/${propertyId}/listings`,
    currentListing: (propertyId: string) =>
      `${API_ROUTE_GROUPS.properties}/${propertyId}/listings/current`,
    offers: (propertyId: string) =>
      `${API_ROUTE_GROUPS.properties}/${propertyId}/offers`,
    viewings: (propertyId: string) =>
      `${API_ROUTE_GROUPS.properties}/${propertyId}/viewings`,
    tasks: (propertyId: string) =>
      `${API_ROUTE_GROUPS.properties}/${propertyId}/tasks`,
    notes: (propertyId: string) =>
      `${API_ROUTE_GROUPS.properties}/${propertyId}/notes`,
    media: (propertyId: string) =>
      `${API_ROUTE_GROUPS.properties}/${propertyId}/media`,
    documents: (propertyId: string) =>
      `${API_ROUTE_GROUPS.properties}/${propertyId}/documents`,
  },
  listings: {
    list: API_ROUTE_GROUPS.listings,
    byId: (id: string) => `${API_ROUTE_GROUPS.listings}/${id}`,
    search: `${API_ROUTE_GROUPS.listings}/search`,
    filter: `${API_ROUTE_GROUPS.listings}/filter`,
    publish: (id: string) => `${API_ROUTE_GROUPS.listings}/${id}/publish`,
    withdraw: (id: string) => `${API_ROUTE_GROUPS.listings}/${id}/withdraw`,
  },
  communities: {
    list: API_ROUTE_GROUPS.communities,
    byId: (id: string) => `${API_ROUTE_GROUPS.communities}/${id}`,
    bySlug: (slug: string) => `${API_ROUTE_GROUPS.communities}/slug/${slug}`,
    search: `${API_ROUTE_GROUPS.communities}/search`,
    filter: `${API_ROUTE_GROUPS.communities}/filter`,
  },
  buildings: {
    list: API_ROUTE_GROUPS.buildings,
    byId: (id: string) => `${API_ROUTE_GROUPS.buildings}/${id}`,
    search: `${API_ROUTE_GROUPS.buildings}/search`,
    filter: `${API_ROUTE_GROUPS.buildings}/filter`,
    byCommunity: (communityId: string) =>
      `${API_ROUTE_GROUPS.buildings}/community/${communityId}`,
  },
  agents: {
    list: API_ROUTE_GROUPS.agents,
    byId: (id: string) => `${API_ROUTE_GROUPS.agents}/${id}`,
    search: `${API_ROUTE_GROUPS.agents}/search`,
    filter: `${API_ROUTE_GROUPS.agents}/filter`,
  },
  owners: {
    list: API_ROUTE_GROUPS.owners,
    byId: (id: string) => `${API_ROUTE_GROUPS.owners}/${id}`,
    search: `${API_ROUTE_GROUPS.owners}/search`,
    filter: `${API_ROUTE_GROUPS.owners}/filter`,
    portfolio: (id: string) => `${API_ROUTE_GROUPS.owners}/${id}/portfolio`,
  },
  buyers: {
    list: API_ROUTE_GROUPS.buyers,
    byId: (id: string) => `${API_ROUTE_GROUPS.buyers}/${id}`,
    search: `${API_ROUTE_GROUPS.buyers}/search`,
    filter: `${API_ROUTE_GROUPS.buyers}/filter`,
  },
  tenants: {
    list: API_ROUTE_GROUPS.tenants,
    byId: (id: string) => `${API_ROUTE_GROUPS.tenants}/${id}`,
    search: `${API_ROUTE_GROUPS.tenants}/search`,
    filter: `${API_ROUTE_GROUPS.tenants}/filter`,
  },
  deals: {
    list: API_ROUTE_GROUPS.deals,
    byId: (id: string) => `${API_ROUTE_GROUPS.deals}/${id}`,
    search: `${API_ROUTE_GROUPS.deals}/search`,
    filter: `${API_ROUTE_GROUPS.deals}/filter`,
    pipeline: `${API_ROUTE_GROUPS.deals}/pipeline`,
    advance: (id: string) => `${API_ROUTE_GROUPS.deals}/${id}/advance`,
  },
  viewings: {
    list: API_ROUTE_GROUPS.viewings,
    byId: (id: string) => `${API_ROUTE_GROUPS.viewings}/${id}`,
    search: `${API_ROUTE_GROUPS.viewings}/search`,
    filter: `${API_ROUTE_GROUPS.viewings}/filter`,
    upcoming: `${API_ROUTE_GROUPS.viewings}/upcoming`,
    today: `${API_ROUTE_GROUPS.viewings}/today`,
    calendar: `${API_ROUTE_GROUPS.viewings}/calendar`,
  },
} as const;
