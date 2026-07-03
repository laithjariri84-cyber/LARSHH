/**
 * Database layer — Prisma client, repository registry, and implementations.
 */

export type { IDatabaseClient } from "./database-client.interface";
export type { ITransactionClient, ITransactionScope } from "./transaction.interface";
export type { IRepositoryRegistryFactory } from "./repository-registry.factory";

export {
  databaseClient,
  createPrismaRepositoryRegistry,
  getRepositoryRegistry,
  PrismaDatabaseClient,
} from "./client";

export { decimalToNumber, numberToDecimalString } from "./utils/decimal";
export { buildPropertyInclude } from "./includes/property.include";
export {
  mapPropertyToAggregate,
  mapPropertyToSummary,
} from "./mappers/property.mapper";

export { createPropertyAggregateRepository } from "./repositories/prisma-property-aggregate.repository";
export { createPropertyChildRepositories } from "./repositories/prisma-child.repositories";
export { createCatalogRepositories } from "./repositories/prisma-catalog.repositories";
export { createEntityRepositories } from "./repositories/prisma-entity.repositories";
