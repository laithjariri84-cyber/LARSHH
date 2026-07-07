/**
 * Server-side performance collector — enabled with PERF_PROFILE=1.
 * Used by scripts/profile-pages.ts for navigation profiling.
 */

export type PerfEntry = {
  scope: string;
  category: "prisma" | "async" | "market-intelligence" | "auth" | "other";
  durationMs: number;
};

export type PageProfile = {
  page: string;
  totalMs: number;
  entries: PerfEntry[];
  summary: {
    prismaMs: number;
    asyncMs: number;
    marketIntelligenceMs: number;
    authMs: number;
    otherMs: number;
    serverRenderMs: number;
  };
};

const entries: PerfEntry[] = [];

export function isPerfProfileEnabled(): boolean {
  return process.env.PERF_PROFILE === "1";
}

export function recordPerf(
  scope: string,
  category: PerfEntry["category"],
  durationMs: number
): void {
  if (!isPerfProfileEnabled()) return;
  entries.push({ scope, category, durationMs });
}

export async function profileAsync<T>(
  scope: string,
  category: PerfEntry["category"],
  fn: () => Promise<T>
): Promise<T> {
  if (!isPerfProfileEnabled()) return fn();
  const start = performance.now();
  try {
    return await fn();
  } finally {
    recordPerf(scope, category, performance.now() - start);
  }
}

export function resetPerf(): void {
  entries.length = 0;
}

export function getPerfEntries(): PerfEntry[] {
  return [...entries];
}

export function summarizePage(page: string, totalMs: number): PageProfile {
  const list = getPerfEntries();
  const sum = (category: PerfEntry["category"]) =>
    list.filter((e) => e.category === category).reduce((a, e) => a + e.durationMs, 0);

  const prismaMs = sum("prisma");
  const asyncMs = sum("async");
  const marketIntelligenceMs = sum("market-intelligence");
  const authMs = sum("auth");
  const categorized =
    prismaMs + asyncMs + marketIntelligenceMs + authMs;
  const otherMs = Math.max(0, totalMs - categorized);

  return {
    page,
    totalMs,
    entries: list,
    summary: {
      prismaMs,
      asyncMs,
      marketIntelligenceMs,
      authMs,
      otherMs,
      serverRenderMs: totalMs,
    },
  };
}

export function formatPageReport(profile: PageProfile): string {
  const { summary } = profile;
  const lines = [
    profile.page,
    `- Server render: ${Math.round(summary.serverRenderMs)}ms`,
    `- Prisma: ${Math.round(summary.prismaMs)}ms`,
    `- Market intelligence: ${Math.round(summary.marketIntelligenceMs)}ms`,
    `- Auth: ${Math.round(summary.authMs)}ms`,
    `- Async (other): ${Math.round(summary.asyncMs)}ms`,
    `- Other/unattributed: ${Math.round(summary.otherMs)}ms`,
  ];

  const topPrisma = profile.entries
    .filter((e) => e.category === "prisma")
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, 8);

  if (topPrisma.length > 0) {
    lines.push("  Top Prisma queries:");
    for (const q of topPrisma) {
      lines.push(`    · ${q.scope}: ${Math.round(q.durationMs)}ms`);
    }
  }

  return lines.join("\n");
}
