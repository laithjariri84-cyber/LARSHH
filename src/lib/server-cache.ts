import { unstable_cache } from "next/cache";

/** Shared cache tags for on-demand revalidation (e.g. after imports). */
export const CACHE_TAGS = {
  marketProfiles: "market-profiles",
  marketRoiProfiles: "market-roi-profiles",
  communities: "communities",
  buildings: "buildings",
  dashboardMetrics: "dashboard-metrics",
} as const;

/** Default revalidation windows (seconds). */
export const REVALIDATE_SECONDS = {
  marketProfiles: 300,
  marketRoiProfiles: 300,
  filterOptions: 120,
  dashboardMetrics: 60,
} as const;

export function cacheMarketProfiles<T>(fn: () => Promise<T>): Promise<T> {
  return unstable_cache(fn, ["market-intelligence-profiles"], {
    revalidate: REVALIDATE_SECONDS.marketProfiles,
    tags: [CACHE_TAGS.marketProfiles],
  })();
}

export function cacheCommunities<T>(fn: () => Promise<T>): Promise<T> {
  return unstable_cache(fn, ["search-communities"], {
    revalidate: REVALIDATE_SECONDS.filterOptions,
    tags: [CACHE_TAGS.communities],
  })();
}

export function cacheBuildings<T>(
  communityId: string | undefined,
  fn: () => Promise<T>
): Promise<T> {
  return unstable_cache(fn, ["search-buildings", communityId ?? "all"], {
    revalidate: REVALIDATE_SECONDS.filterOptions,
    tags: [CACHE_TAGS.buildings],
  })();
}

export function cacheDashboardMetrics<T>(
  scopeKey: string,
  fn: () => Promise<T>
): Promise<T> {
  return unstable_cache(fn, ["dashboard-metrics", scopeKey], {
    revalidate: REVALIDATE_SECONDS.dashboardMetrics,
    tags: [CACHE_TAGS.dashboardMetrics],
  })();
}

export function cacheMarketRoiProfiles<T>(fn: () => Promise<T>): Promise<T> {
  return unstable_cache(fn, ["market-roi-profiles"], {
    revalidate: REVALIDATE_SECONDS.marketRoiProfiles,
    tags: [CACHE_TAGS.marketRoiProfiles],
  })();
}
