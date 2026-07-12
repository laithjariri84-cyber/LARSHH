import { prisma } from "../src/lib/prisma";
import { seedRoleSystem } from "../prisma/seeds/role-system.seed";

seedRoleSystem(prisma)
  .then((result) => {
    console.log("[db:seed:roles] complete:", result);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
