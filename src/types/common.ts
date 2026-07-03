/**
 * Shared cross-cutting types for the data architecture.
 * These types are transport- and persistence-agnostic.
 */

export type SortOrder = "asc" | "desc";

export type SortParams = {
  sortBy?: string;
  sortOrder?: SortOrder;
};

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export type RepositoryResult<T> =
  | { success: true; data: T }
  | { success: false; error: RepositoryError };

export type RepositoryErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "INTERNAL_ERROR";

export type RepositoryError = {
  code: RepositoryErrorCode;
  message: string;
  details?: Record<string, unknown>;
};

export type DateRangeFilter = {
  from?: Date | string;
  to?: Date | string;
};

export type TextSearchParams = {
  query: string;
  fields?: string[];
};

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function normalizePagination(
  params?: PaginationParams
): Required<Pick<PaginationParams, "page" | "pageSize">> {
  const page = Math.max(1, params?.page ?? DEFAULT_PAGE);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, params?.pageSize ?? DEFAULT_PAGE_SIZE)
  );
  return { page, pageSize };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
