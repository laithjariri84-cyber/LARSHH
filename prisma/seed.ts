import { prisma } from "../src/lib/prisma";

import { seedMarketIntelligence } from "./seed-market-intelligence";
import { seedRoleSystem } from "./seeds/role-system.seed";

async function main() {
  const roleResult = await seedRoleSystem(prisma);
  console.log("[seed] Role system:", roleResult);

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
