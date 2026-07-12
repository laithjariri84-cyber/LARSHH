import { PrismaClient } from "@prisma/client";

async function main() {
  const urls = [
    { label: "DATABASE_URL", url: process.env.DATABASE_URL?.trim() },
    { label: "DIRECT_URL", url: process.env.DIRECT_URL?.trim() },
  ].filter((entry): entry is { label: string; url: string } => Boolean(entry.url));

  for (const { label, url } of urls) {
    const host = new URL(url).host;
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
      await prisma.$connect();
      const count = await prisma.property.count();
      console.log(`[ok] ${label} (${host}) — properties: ${count}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message.split("\n")[0] : String(error);
      console.log(`[fail] ${label} (${host}) — ${msg}`);
    } finally {
      await prisma.$disconnect();
    }
  }
}

main();
