/**
 * Service-layer result types.
 * Services translate repository errors into domain-friendly outcomes for API/UI.
 */

export type ServiceErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL_ERROR";

export type ServiceError = {
  code: ServiceErrorCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServiceError };
