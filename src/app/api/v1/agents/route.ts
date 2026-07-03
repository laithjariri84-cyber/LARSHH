import { NextRequest } from "next/server";

import { fromServiceResult } from "@/lib/api/response";
import { parseQuery, toRepositoryQuery } from "@/lib/api/parse-request";
import { getServices } from "@/lib/api/services";
import { paginationQuerySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const parsed = parseQuery(request.nextUrl.searchParams, paginationQuerySchema);
  if (!parsed.ok) return parsed.response;

  const result = await getServices().catalog.agents.list(
    toRepositoryQuery(parsed.data)
  );
  return fromServiceResult(result);
}
