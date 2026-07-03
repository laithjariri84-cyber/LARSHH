import type { IRepositoryRegistry } from "@/repositories/repository-registry";

/**
 * Transaction-scoped repository access.
 * All operations within run() share one atomic transaction.
 */
export interface ITransactionScope {
  repositories: IRepositoryRegistry;
}

export interface ITransactionClient {
  run<T>(fn: (scope: ITransactionScope) => Promise<T>): Promise<T>;
}
