import { NextResponse } from "next/server";

import type { ServiceError, ServiceResult } from "@/types/service";
import type { ApiErrorBody, ApiSuccessBody } from "@/types/api";

const ERROR_STATUS: Record<ServiceError["code"], number> = {
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  CONFLICT: 409,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNAL_ERROR: 500,
};

export function apiSuccess<T>(
  data: T,
  meta?: Record<string, unknown>,
  status = 200
): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) }, { status });
}

export function apiError(
  error: ServiceError,
  status?: number
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message,
        ...(error.fieldErrors ? { details: error.fieldErrors } : {}),
      },
    },
    { status: status ?? ERROR_STATUS[error.code] ?? 500 }
  );
}

export function fromServiceResult<T>(
  result: ServiceResult<T>,
  meta?: Record<string, unknown>
): NextResponse {
  if (!result.ok) return apiError(result.error);
  return apiSuccess(result.data, meta);
}

export function validationError(
  message: string,
  fieldErrors?: Record<string, string[]>
): NextResponse<ApiErrorBody> {
  return apiError(
    { code: "VALIDATION_ERROR", message, fieldErrors },
    400
  );
}

export function parseJsonBody<T>(body: unknown): T {
  return body as T;
}
