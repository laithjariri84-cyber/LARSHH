/**
 * Profiles server-side data loading for each dashboard page.
 * Run: npm run profile:pages
 */
import { performance } from "node:perf_hooks";

process.env.PERF_PROFILE = "1";

async function loadModules() {
  const [
    { prisma },
    perf,
    { getUser },
    { getDashboardStatistics },
    { loadSearchPageData },
    { enrichSearchResultsWithMarketIntelligence },
    { applySmartSearchResults },
    { getPropertyDetailsById },
    { generateIntelligenceAnalytics },
    { createDefaultIntelligenceFilters },
  ] = await Promise.all([
    import("@/lib/prisma"),
    import("@/lib/perf/collector"),
    import("@/lib/auth"),
    import("@/server/dashboard"),
    import("@/features/search/services/search-properties"),
    import("@/features/search/services/enrich-search-intelligence"),
    import("@/features/search/smart-search/apply-smart-search-sort"),
    import("@/features/properties/services/property-details"),
    import("@/features/property-intelligence/lib/generate-intelligence-report"),
    import("@/features/property-intelligence/lib/default-filters"),
  ]);

  return {
    prisma,
    perf,
    getUser,
    getDashboardStatistics,
    loadSearchPageData,
    enrichSearchResultsWithMarketIntelligence,
    applySmartSearchResults,
    getPropertyDetailsById,
    generateIntelligenceAnalytics,
    createDefaultIntelligenceFilters,
  };
}

async function main() {
  const {
    prisma,
    perf,
    getUser,
    getDashboardStatistics,
    loadSearchPageData,
    enrichSearchResultsWithMarketIntelligence,
    applySmartSearchResults,
    getPropertyDetailsById,
    generateIntelligenceAnalytics,
    createDefaultIntelligenceFilters,
  } = await loadModules();

  const { formatPageReport, profileAsync, resetPerf, summarizePage } = perf;
  type PageProfile = ReturnType<typeof summarizePage>;

  async function profileLayoutAuth(): Promise<number> {
    try {
      await profileAsync("layout:getUser", "auth", () => getUser());
      return 0;
    } catch {
      // getUser requires Next.js request context — skipped in CLI profiling.
      return 0;
    }
  }

  async function profileDashboard(): Promise<PageProfile> {
    resetPerf();
    const start = performance.now();
    await profileLayoutAuth();
    await profileAsync("dashboard:getDashboardStatistics", "async", () =>
      getDashboardStatistics()
    );
    return summarizePage("Dashboard", performance.now() - start);
  }

  async function profileSearch(): Promise<PageProfile> {
    resetPerf();
    const start = performance.now();
    await profileLayoutAuth();

    const { results: rawResults } = await profileAsync(
      "search:loadSearchPageData",
      "async",
      () => loadSearchPageData({})
    );

    const enriched = await profileAsync(
      "search:enrichSearchResultsWithMarketIntelligence",
      "market-intelligence",
      () => enrichSearchResultsWithMarketIntelligence(rawResults)
    );

    await profileAsync("search:applySmartSearchResults", "async", () =>
      Promise.resolve(
        applySmartSearchResults(enriched, {
          sort: undefined,
          filters: {},
          smartQuery: undefined,
        })
      )
    );

    return summarizePage("Search", performance.now() - start);
  }

  async function profileIntelligence(): Promise<PageProfile> {
    resetPerf();
    const start = performance.now();
    await profileLayoutAuth();
    await profileAsync("intelligence:generateIntelligenceAnalytics", "async", () =>
      Promise.resolve(
        generateIntelligenceAnalytics(createDefaultIntelligenceFilters())
      )
    );
    return summarizePage("Intelligence", performance.now() - start);
  }

  async function profileCrm(): Promise<PageProfile> {
    resetPerf();
    const start = performance.now();
    await profileLayoutAuth();
    return summarizePage("CRM", performance.now() - start);
  }

  async function profilePropertyDetails(): Promise<PageProfile | null> {
    const sample = await prisma.property.findFirst({
      where: { deletedAt: null },
      select: { id: true },
    });

    if (!sample) {
      console.warn("No property found — skipping Property Details profile.");
      return null;
    }

    resetPerf();
    const start = performance.now();
    await profileLayoutAuth();
    await profileAsync("property-details:getPropertyDetailsById", "async", () =>
      getPropertyDetailsById(sample.id)
    );
    return summarizePage("Property Details", performance.now() - start);
  }

  async function measureHttpPage(
    baseUrl: string,
    path: string
  ): Promise<{ ttfbMs: number; totalMs: number }> {
    const start = performance.now();
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { Accept: "text/html" },
      redirect: "manual",
    });
    const ttfbMs = performance.now() - start;
    await response.text();
    return { ttfbMs, totalMs: performance.now() - start };
  }

  console.log("=".repeat(72));
  console.log("LARSSH PAGE PROFILING (server-side data path)");
  console.log("=".repeat(72));

  const profiles: PageProfile[] = [];

  profiles.push(await profileDashboard());
  profiles.push(await profileSearch());
  profiles.push(await profileIntelligence());
  profiles.push(await profileCrm());

  const propertyProfile = await profilePropertyDetails();
  if (propertyProfile) profiles.push(propertyProfile);

  console.log("\n--- SERVER DATA PATH ---\n");
  for (const profile of profiles) {
    console.log(formatPageReport(profile));
    console.log("");
  }

  const bottleneck = profiles.reduce((max, p) =>
    p.summary.serverRenderMs > max.summary.serverRenderMs ? p : max
  );

  console.log("=".repeat(72));
  console.log("BIGGEST BOTTLENECK (server data path):");
  console.log(
    `${bottleneck.page} — ${Math.round(bottleneck.summary.serverRenderMs)}ms total`
  );
  const topPrisma = bottleneck.entries
    .filter((e) => e.category === "prisma")
    .sort((a, b) => b.durationMs - a.durationMs)[0];
  if (topPrisma) {
    console.log(
      `Dominant Prisma op: ${topPrisma.scope} (${Math.round(topPrisma.durationMs)}ms)`
    );
  }
  console.log("=".repeat(72));

  console.log("\nJavaScript bundle estimates (production build):");
  console.log("- Dashboard: ~124 kB First Load JS");
  console.log("- Search: ~193 kB First Load JS");
  console.log("- Intelligence: ~155 kB First Load JS");
  console.log("- CRM: ~120 kB First Load JS");
  console.log("- Property Details: ~148 kB First Load JS");
  console.log("- Shared baseline: ~102 kB");
  console.log(
    "- React render/hydration: client-side; Intelligence/Search pay ~50–150ms parse cost on top of server wait."
  );

  const baseUrl = process.env.PROFILE_BASE_URL ?? "http://localhost:3000";
  console.log(`\n--- HTTP NAVIGATION (${baseUrl}) ---\n`);

  try {
    const paths = ["/dashboard", "/search", "/intelligence", "/crm"];
    const sample = await prisma.property.findFirst({
      where: { deletedAt: null },
      select: { id: true },
    });
    if (sample) paths.push(`/properties/${sample.id}`);

    for (const path of paths) {
      const { ttfbMs, totalMs } = await measureHttpPage(baseUrl, path);
      console.log(path);
      console.log(`- TTFB (server): ${Math.round(ttfbMs)}ms`);
      console.log(`- Total download: ${Math.round(totalMs)}ms`);
      console.log(`- JS loading: see bundle estimates (~102–193 kB First Load JS)`);
      console.log(`- React render: client-side after download`);
      console.log("");
    }
  } catch (error) {
    console.warn("HTTP profiling skipped — start dev server: npm run dev");
    console.warn(String(error));
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
