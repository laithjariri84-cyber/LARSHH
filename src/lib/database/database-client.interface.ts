import type { IRepositoryRegistry } from "@/repositories/repository-registry";

/**
 * Minimal database client contract.
 * Wraps connection lifecycle; implementations may use Prisma, Drizzle, etc.
 */
export interface IDatabaseClient {
  /** Whether the client can reach the database. */
  healthCheck(): Promise<boolean>;

  /** Access the full repository registry bound to this connection. */
  repositories(): IRepositoryRegistry;

  /** Gracefully release connections. */
  disconnect(): Promise<void>;
}
