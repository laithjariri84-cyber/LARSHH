import type { ZodSchema } from "zod";

import { validationError } from "./response";

export function parseQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): { ok: true; data: T } | { ok: false; response: ReturnType<typeof validationError> } {
  const raw = Object.fromEntries(searchParams.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "query";
      fieldErrors[key] = fieldErrors[key] ?? [];
      fieldErrors[key].push(issue.message);
    }
    return {
      ok: false,
      response: validationError("Invalid query parameters", fieldErrors),
    };
  }
  return { ok: true, data: parsed.data };
}

export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<
  { ok: true; data: T } | { ok: false; response: ReturnType<typeof validationError> }
> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return {
      ok: false,
      response: validationError("Request body must be valid JSON"),
    };
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "body";
      fieldErrors[key] = fieldErrors[key] ?? [];
      fieldErrors[key].push(issue.message);
    }
    return {
      ok: false,
      response: validationError("Invalid request body", fieldErrors),
    };
  }

  return { ok: true, data: parsed.data };
}

export function toRepositoryQuery(query: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return {
    page: query.page,
    pageSize: query.pageSize,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
}
