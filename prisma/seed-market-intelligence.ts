import { prisma } from "../src/lib/prisma";

import {
  MARKET_INTELLIGENCE_SEED,
  toPrismaMarketSeed,
} from "./seeds/market-intelligence.seed";
import { seedVerifiedCmsProfiles } from "./seeds/verified-market-research.seed";

export async function seedMarketIntelligence() {
  console.log(
    `Seeding ${MARKET_INTELLIGENCE_SEED.length} community market intelligence profiles…`
  );

  for (const row of MARKET_INTELLIGENCE_SEED) {
    await prisma.communityMarketIntelligence.upsert({
      where: {
        communitySlug_bedroomCount: {
          communitySlug: row.communitySlug,
          bedroomCount: row.bedroomCount,
        },
      },
      create: toPrismaMarketSeed(row),
      update: toPrismaMarketSeed(row),
    });
  }

  console.log("Market intelligence seed complete.");

  const cmsResult = await seedVerifiedCmsProfiles();
  if (cmsResult.upserted.length) {
    console.log(
      `Verified CMS profiles upserted: ${cmsResult.upserted.join(", ")}`
    );
  }
  if (cmsResult.skipped.length) {
    console.log(
      `Verified CMS skipped (community not in DB): ${cmsResult.skipped.join(", ")}`
    );
  }
}

async function main() {
  await seedMarketIntelligence();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
