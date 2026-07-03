import type { Prisma } from "@prisma/client";

import type { RepositoryQueryParams } from "@/types/repository";
import {
  buildPaginationMeta,
  normalizePagination,
} from "@/types/common";

export function toSkipTake(query?: RepositoryQueryParams) {
  const { page, pageSize } = normalizePagination(query);
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function toPaginated<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return {
    data,
    pagination: buildPaginationMeta(total, page, pageSize),
  };
}

type RelationOrderByResolver = (
  field: string,
  order: Prisma.SortOrder
) => Record<string, unknown> | null | undefined;

/**
 * Builds a Prisma orderBy clause with an optional allowlist and relation mapping.
 * Unknown sortBy values fall back to defaultField.
 */
export function buildOrderBy(
  query?: RepositoryQueryParams,
  defaultField = "updatedAt",
  allowedFields?: readonly string[],
  relationOrderBy?: RelationOrderByResolver
): Record<string, unknown> {
  const order = query?.sortOrder ?? "desc";
  const requested = query?.sortBy ?? defaultField;
  const allowed = allowedFields ?? [defaultField];
  const field = allowed.includes(requested) ? requested : defaultField;

  const relation = relationOrderBy?.(field, order);
  if (relation) {
    return relation;
  }

  return { [field]: order };
}

export function buildTextSearchWhere(
  query: string | undefined,
  fields: string[]
): Record<string, unknown> | undefined {
  if (!query?.trim()) return undefined;
  return {
    OR: fields.map((field) => ({
      [field]: { contains: query.trim(), mode: "insensitive" as const },
    })),
  };
}
