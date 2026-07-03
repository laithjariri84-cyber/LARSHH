import { prisma } from "../src/lib/prisma";

import { seedMarketIntelligence } from "./seed-market-intelligence";

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
