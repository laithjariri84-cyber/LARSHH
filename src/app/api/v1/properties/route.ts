import { NextRequest } from "next/server";

import { fromServiceResult } from "@/lib/api/response";
import { parseBody, parseQuery, toRepositoryQuery } from "@/lib/api/parse-request";
import { getPropertyService } from "@/lib/api/services";
import {
  createPropertySchema,
  propertySearchQuerySchema,
} from "@/lib/validation";

export async function GET(request: NextRequest) {
  const parsed = parseQuery(request.nextUrl.searchParams, propertySearchQuerySchema);
  if (!parsed.ok) return parsed.response;

  const { q, profile, ...filters } = parsed.data;
  const service = getPropertyService();
  const hasFilters =
    Boolean(q) ||
    Object.values(filters).some((v) => v !== undefined && v !== "");

  const result = hasFilters
    ? await service.search({ query: q ?? "", ...filters }, toRepositoryQuery(parsed.data))
    : await service.list(toRepositoryQuery(parsed.data));

  return fromServiceResult(result, { profile: profile ?? "summary" });
}

export async function POST(request: NextRequest) {
  const parsed = await parseBody(request, createPropertySchema);
  if (!parsed.ok) return parsed.response;

  const service = getPropertyService();
  const result = await service.create(parsed.data);
  return fromServiceResult(result);
}
