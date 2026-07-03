/**
 * Base repository contract shared by all entity repositories.
 *
 * Decision: Every repository exposes the same six operations so services
 * and API handlers can depend on predictable contracts. Implementations
 * (Prisma, in-memory, mock) swap without changing consumers.
 */

import type { PaginatedResult, PaginationParams, SortParams } from "./common";

export type RepositoryQueryParams = PaginationParams & SortParams;

export interface IBaseRepository<
  TEntity,
  TCreateInput,
  TUpdateInput,
  TFilterParams,
  TSearchParams,
> {
  /** Persist a new entity. */
  create(input: TCreateInput): Promise<TEntity>;

  /** Fetch a single entity by primary key. Returns null when not found. */
  findById(id: string): Promise<TEntity | null>;

  /** List entities with optional pagination and sorting. */
  findMany(params?: RepositoryQueryParams): Promise<PaginatedResult<TEntity>>;

  /** Partial update by primary key. Throws or returns error when not found. */
  update(id: string, input: TUpdateInput): Promise<TEntity>;

  /** Hard delete by primary key. */
  delete(id: string): Promise<void>;

  /** Full-text or field-based search with pagination. */
  search(
    params: TSearchParams,
    query?: RepositoryQueryParams
  ): Promise<PaginatedResult<TEntity>>;

  /** Structured filter query with pagination. */
  filter(
    params: TFilterParams,
    query?: RepositoryQueryParams
  ): Promise<PaginatedResult<TEntity>>;
}
