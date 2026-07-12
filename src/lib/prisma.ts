import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** True when DATABASE_URL is present (value never logged). */
export function isDatabaseUrlConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

/**
 * Lazy singleton — importing this module must not instantiate PrismaClient.
 * Client bundles may import server modules that reference `prisma`; the client
 * is only created on first server-side property access.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === "then") {
      return undefined;
    }

    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];

    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }

    return value;
  },
});

/** @deprecated Use `prisma` — single shared client only. */
export function getDirectPrisma(): PrismaClient {
  return getPrismaClient();
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Define it in .env.local (see .env.example)."
    );
  }
  return url;
}

export function getDirectDatabaseUrl(): string {
  return process.env.DIRECT_URL?.trim() || getDatabaseUrl();
}
