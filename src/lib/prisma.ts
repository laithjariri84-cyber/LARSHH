import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
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

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient(resolveDatabaseUrl());

/**
 * Session/direct connection for interactive transactions (imports, long writes).
 * Uses DIRECT_URL when set; otherwise falls back to DATABASE_URL.
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

export function getDirectDatabaseUrl(): string {
  return resolveDirectUrl() ?? resolveDatabaseUrl();
}
