import type { ApiListQuery, ApiResponse } from "@/types";

/**
 * Context passed to every API handler (auth, request metadata).
 */
export type IApiHandlerContext = {
  userId?: string;
  requestId?: string;
};

/**
 * Generic HTTP handler contract for a single operation.
 */
export type IApiHandler<TRequest, TResponse> = (
  request: TRequest,
  context: IApiHandlerContext
) => Promise<Response | ApiResponse<TResponse>>;
export type ApiListHandler<TFilter, TEntity> = IApiHandler<
  ApiListQuery & TFilter,
  TEntity[]
>;

export type ApiGetHandler<TEntity> = IApiHandler<
  { id: string },
  TEntity
>;

export type ApiCreateHandler<TInput, TEntity> = IApiHandler<
  TInput,
  TEntity
>;

export type ApiUpdateHandler<TInput, TEntity> = IApiHandler<
  { id: string } & TInput,
  TEntity
>;

export type ApiDeleteHandler = IApiHandler<{ id: string }, void>;
