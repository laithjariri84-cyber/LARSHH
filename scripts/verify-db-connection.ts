import { PrismaClient } from "@prisma/client";

async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const directUrl = process.env.DIRECT_URL?.trim();

  console.log("[verify] DATABASE_URL host:", safeHost(databaseUrl));
  console.log("[verify] DIRECT_URL host:", safeHost(directUrl));

  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: ["error"],
  });

  try {
    await prisma.$connect();
    console.log("[verify] Prisma connect: OK");

    const [properties, communities, intelligence] = await Promise.all([
      prisma.property.findMany({ take: 3, where: { deletedAt: null } }),
      prisma.community.findMany({ take: 3 }),
      prisma.communityMarketIntelligence.findMany({ take: 3 }),
    ]);

    console.log("[verify] Property.findMany():", properties.length, "rows (sample)");
    console.log("[verify] Community.findMany():", communities.length, "rows (sample)");
    console.log(
      "[verify] CommunityMarketIntelligence.findMany():",
      intelligence.length,
      "rows (sample)"
    );

    const listingCount = await prisma.listing.count({ where: { deletedAt: null } });
    console.log("[verify] Active listings:", listingCount);
  } finally {
    await prisma.$disconnect();
  }
}

function safeHost(url: string | undefined): string {
  if (!url) return "(not set)";
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}:${parsed.port || "5432"}`;
  } catch {
    return "(invalid url)";
  }
}

main().catch((error) => {
  console.error("[verify] FAILED:", error instanceof Error ? error.message : error);
  process.exit(1);
});
