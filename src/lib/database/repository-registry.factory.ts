import type { IDatabaseClient } from "./database-client.interface";
import type { IRepositoryRegistry } from "@/repositories/repository-registry";

/**
 * Factory for creating repository registries.
 *
 * Decision: Separating factory from client allows in-memory registries
 * for tests without instantiating a database client.
 */
export interface IRepositoryRegistryFactory {
  create(): IRepositoryRegistry;

  createWithClient(client: IDatabaseClient): IRepositoryRegistry;
}
