import { PrismaClient } from "@prisma/client";

import { isPerfProfileEnabled, recordPerf } from "@/lib/perf/collector";
import { isPerfLogEnabled, perfLog } from "@/lib/perf/timer";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createInstrumentedPrisma> | undefined;
  directPrisma: PrismaClient | undefined;
};

function withConnectionLimit(url: string): string {
  const limit = process.env.PRISMA_CONNECTION_LIMIT?.trim();
  if (!limit) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("connection_limit")) {
      parsed.searchParams.set("connection_limit", limit);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Define it in .env (see .env.example). " +
        "If .env.local also defines DATABASE_URL, it overrides .env in Next.js."
    );
  }
  return withConnectionLimit(url);
}

function resolveDirectUrl(): string | undefined {
  const direct = process.env.DIRECT_URL?.trim();
  if (direct) {
    return withConnectionLimit(direct);
  }

  // Vercel deployments sometimes omit DIRECT_URL; fall back for runtime queries.
  const databaseUrl = process.env.DATABASE_URL?.trim();
  return databaseUrl ? withConnectionLimit(databaseUrl) : undefined;
}

function createPrismaClient(databaseUrl: string): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function createInstrumentedPrisma(databaseUrl: string) {
  const base = createPrismaClient(databaseUrl);
  const shouldLog = isPerfLogEnabled();
  const shouldCollect = isPerfProfileEnabled();

  if (!shouldLog && !shouldCollect) {
    return base;
  }

  return base.$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        const start = performance.now();
        try {
          return await query(args);
        } finally {
          const durationMs = performance.now() - start;
          const scope = model ? `prisma.${model}.${operation}` : `prisma.${operation}`;
          if (shouldLog) {
            perfLog(scope, durationMs);
          }
          if (shouldCollect) {
            recordPerf(scope.replace(/^prisma\./, ""), "prisma", durationMs);
          }
        }
      },
    },
  });
}

export const prisma = (
  globalForPrisma.prisma ?? createInstrumentedPrisma(resolveDatabaseUrl())
) as PrismaClient;

/**
 * Session/direct connection for interactive transactions (imports, long writes).
 * Falls back to the pooled DATABASE_URL when DIRECT_URL is unset.
 */
export function getDirectPrisma(): PrismaClient {
  if (globalForPrisma.directPrisma) {
    return globalForPrisma.directPrisma;
  }

  const directUrl = resolveDirectUrl() ?? resolveDatabaseUrl();
  const client = createPrismaClient(directUrl);
  globalForPrisma.directPrisma = client;
  return client;
}

globalForPrisma.prisma = prisma;

export function getDatabaseUrl(): string {
  return resolveDatabaseUrl();
}
