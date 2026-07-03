/**
 * HTTP/API transport types.
 * Used by route handlers in src/app/api/ when Phase 2 wiring begins.
 */

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export type ApiSuccessBody<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiResponse<T> = ApiSuccessBody<T> | ApiErrorBody;

export type ApiListQuery = {
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  q?: string;
};
