/**
 * Try common Supabase connection string formats to diagnose auth vs reachability.
 * Does not print passwords.
 */
import { PrismaClient } from "@prisma/client";

const PROJECT_REF = "vuwghcgmoyncvrlwpalj";
const PASSWORD = process.env.DB_PASSWORD?.trim() ?? "";
const REGION = "aws-1-ap-northeast-1";

function buildCandidates(password: string): Array<{ label: string; url: string }> {
  const encoded = encodeURIComponent(password);
  return [
    {
      label: "pooler transaction 6543 + pgbouncer + ssl",
      url: `postgresql://postgres.${PROJECT_REF}:${encoded}@${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`,
    },
    {
      label: "pooler transaction 6543 + pgbouncer",
      url: `postgresql://postgres.${PROJECT_REF}:${encoded}@${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true`,
    },
    {
      label: "pooler session 5432",
      url: `postgresql://postgres.${PROJECT_REF}:${encoded}@${REGION}.pooler.supabase.com:5432/postgres`,
    },
    {
      label: "direct db host postgres user",
      url: `postgresql://postgres:${encoded}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
    },
    {
      label: "env DATABASE_URL",
      url: process.env.DATABASE_URL?.trim() ?? "",
    },
    {
      label: "env DIRECT_URL",
      url: process.env.DIRECT_URL?.trim() ?? "",
    },
  ].filter((c) => c.url);
}

async function tryConnect(label: string, url: string) {
  const prisma = new PrismaClient({
    datasources: { db: { url } },
    log: [],
  });

  try {
    await prisma.$connect();
    const count = await prisma.property.count();
    console.log(`[ok] ${label} — property count: ${count}`);
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message.split("\n")[0] : String(error);
    console.log(`[fail] ${label} — ${msg}`);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  if (!PASSWORD) {
    // Extract password from DATABASE_URL if DB_PASSWORD not set
    const dbUrl = process.env.DATABASE_URL ?? "";
    const match = dbUrl.match(/postgres\.[^:]+:([^@]+)@/);
    if (match?.[1]) {
      process.env.DB_PASSWORD = decodeURIComponent(match[1]);
    }
  }

  const password = process.env.DB_PASSWORD?.trim() ?? "";
  if (!password) {
    console.error("No password available");
    process.exit(1);
  }

  for (const candidate of buildCandidates(password)) {
    await tryConnect(candidate.label, candidate.url);
  }
}

main();
