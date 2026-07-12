import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Supabase session pooler allows very few connections per client/process. */
const DEFAULT_CONNECTION_LIMIT = "1";

function withPoolParams(url: string): string {
  try {
    const parsed = new URL(url);
    const limit =
      process.env.PRISMA_CONNECTION_LIMIT?.trim() || DEFAULT_CONNECTION_LIMIT;

    if (!parsed.searchParams.has("connection_limit")) {
      parsed.searchParams.set("connection_limit", limit);
    }

    // Transaction pooler (6543) requires pgbouncer mode for Prisma.
    if (parsed.port === "6543" && !parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
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
      "DATABASE_URL is not set. Define it in .env.local (see .env.example). " +
        "Use the Supabase transaction pooler on port 6543 with ?pgbouncer=true."
    );
  }
  return withPoolParams(url);
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: resolveDatabaseUrl(),
      },
    },
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;

/**
 * @deprecated Use `prisma` — single shared client only.
 * Import adapter kept this alias for long transactions on the same pool.
 */
export function getDirectPrisma(): PrismaClient {
  return prisma;
}

export function getDatabaseUrl(): string {
  return resolveDatabaseUrl();
}

export function getDirectDatabaseUrl(): string {
  const direct = process.env.DIRECT_URL?.trim();
  if (direct) {
    return withPoolParams(direct);
  }
  return resolveDatabaseUrl();
}
