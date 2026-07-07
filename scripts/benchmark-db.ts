/**
 * Benchmarks dashboard + search database paths (uncached Prisma queries).
 * Run: npm run benchmark:db
 *
 * For end-to-end page timing with Next.js caches, use `npm run dev` and watch [PERF] logs.
 */
import { performance } from "node:perf_hooks";

import { prisma } from "@/lib/prisma";
import { queryDashboardMetrics } from "@/server/dashboard/dashboard.repository";
import { querySearchProperties } from "@/lib/repositories/property.repository";

process.env.PERF_LOG = "1";

async function time(label: string, fn: () => Promise<unknown>) {
  const start = performance.now();
  try {
    await fn();
    const ms = Math.round(performance.now() - start);
    console.log(`[BENCH] ${label}: ${ms}ms`);
    return ms;
  } catch (error) {
    const ms = Math.round(performance.now() - start);
    console.log(`[BENCH] ${label}: ${ms}ms (error)`);
    console.error(error);
    return ms;
  }
}

async function main() {
  console.log("=== Sprint 1.1 DB benchmark (uncached queries) ===\n");

  const dashboardCold = await time("queryDashboardMetrics (cold)", () =>
    queryDashboardMetrics({})
  );
  const searchCold = await time("querySearchProperties (cold)", () =>
    querySearchProperties({})
  );

  console.log("\n=== Warm (same process, DB buffer cache) ===\n");

  const dashboardWarm = await time("queryDashboardMetrics (warm)", () =>
    queryDashboardMetrics({})
  );
  const searchWarm = await time("querySearchProperties (warm)", () =>
    querySearchProperties({})
  );

  console.log("\n=== Summary ===");
  console.log(`Dashboard: cold=${dashboardCold}ms warm=${dashboardWarm}ms (target <800ms)`);
  console.log(`Search properties: cold=${searchCold}ms warm=${searchWarm}ms (target <1000ms)`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
