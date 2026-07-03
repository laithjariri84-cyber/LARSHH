import { NextRequest } from "next/server";

import { fromServiceResult } from "@/lib/api/response";
import { parseQuery, toRepositoryQuery } from "@/lib/api/parse-request";
import { getPropertyService } from "@/lib/api/services";
import { propertySearchQuerySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const parsed = parseQuery(request.nextUrl.searchParams, propertySearchQuerySchema);
  if (!parsed.ok) return parsed.response;

  const { q, ...filters } = parsed.data;
  const service = getPropertyService();
  const result = await service.search(
    { query: q ?? "", ...filters },
    toRepositoryQuery(parsed.data)
  );
  return fromServiceResult(result);
}
