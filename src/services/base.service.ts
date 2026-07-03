import type {
  PaginatedResult,
  PaginationParams,
  ServiceResult,
  SortParams,
} from "@/types";

/**
 * Base service operations mirroring repository CRUD with ServiceResult wrapping.
 *
 * Decision: Services return ServiceResult instead of throwing so API handlers
 * can map errors to HTTP status codes consistently.
 */
export interface IBaseService<
  TEntity,
  TCreateInput,
  TUpdateInput,
  TFilterParams,
  TSearchParams,
> {
  create(input: TCreateInput): Promise<ServiceResult<TEntity>>;
  getById(id: string): Promise<ServiceResult<TEntity>>;
  list(
    params?: PaginationParams & SortParams
  ): Promise<ServiceResult<PaginatedResult<TEntity>>>;
  update(id: string, input: TUpdateInput): Promise<ServiceResult<TEntity>>;
  remove(id: string): Promise<ServiceResult<void>>;
  search(
    params: TSearchParams,
    query?: PaginationParams & SortParams
  ): Promise<ServiceResult<PaginatedResult<TEntity>>>;
  filter(
    params: TFilterParams,
    query?: PaginationParams & SortParams
  ): Promise<ServiceResult<PaginatedResult<TEntity>>>;
}
