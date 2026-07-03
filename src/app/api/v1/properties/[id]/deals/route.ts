import { NextRequest } from "next/server";

import { apiSuccess, fromServiceResult } from "@/lib/api/response";
import { parseBody, parseQuery, toRepositoryQuery } from "@/lib/api/parse-request";
import { createEntityRepositories } from "@/lib/database/repositories/prisma-entity.repositories";
import { prisma } from "@/lib/prisma";
import {
  createDealSchema,
  propertyIdParamSchema,
  paginationQuerySchema,
} from "@/lib/validation";

const entityRepos = createEntityRepositories(prisma);

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const idParsed = propertyIdParamSchema.safeParse(params);
  if (!idParsed.success) {
    return fromServiceResult({
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid property id" },
    });
  }

  const queryParsed = parseQuery(request.nextUrl.searchParams, paginationQuerySchema);
  const query = queryParsed.ok ? toRepositoryQuery(queryParsed.data) : undefined;

  const result = await entityRepos.deals.findByProperty(idParsed.data.id, query);
  return apiSuccess(result.data, { pagination: result.pagination });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const idParsed = propertyIdParamSchema.safeParse(params);
  if (!idParsed.success) {
    return fromServiceResult({
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid property id" },
    });
  }

  const bodyParsed = await parseBody(request, createDealSchema);
  if (!bodyParsed.ok) return bodyParsed.response;

  const deal = await entityRepos.deals.create(bodyParsed.data);
  if (deal.propertyId !== idParsed.data.id) {
    return fromServiceResult({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Listing does not belong to this property",
      },
    });
  }

  return apiSuccess(deal, undefined, 201);
}
