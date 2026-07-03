import type { PrismaClient } from "@prisma/client";

import type { IRepositoryRegistry } from "@/repositories/repository-registry";
import { prisma } from "@/lib/prisma";

import { createCatalogRepositories } from "./repositories/prisma-catalog.repositories";
import { createPropertyChildRepositories } from "./repositories/prisma-child.repositories";
import { createPropertyAggregateRepository } from "./repositories/prisma-property-aggregate.repository";

let registrySingleton: IRepositoryRegistry | null = null;

export function createPrismaRepositoryRegistry(
  db: PrismaClient = prisma
): IRepositoryRegistry {
  return {
    property: createPropertyAggregateRepository(db),
    propertyChildren: createPropertyChildRepositories(db),
    catalog: createCatalogRepositories(db),
  };
}

export function getRepositoryRegistry(): IRepositoryRegistry {
  if (!registrySingleton) {
    registrySingleton = createPrismaRepositoryRegistry();
  }
  return registrySingleton;
}

export class PrismaDatabaseClient {
  async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  repositories(): IRepositoryRegistry {
    return getRepositoryRegistry();
  }

  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}

export const databaseClient = new PrismaDatabaseClient();
