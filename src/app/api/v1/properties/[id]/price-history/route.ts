import { NextRequest } from "next/server";

import { apiSuccess, fromServiceResult } from "@/lib/api/response";
import { parseBody } from "@/lib/api/parse-request";
import { createEntityRepositories } from "@/lib/database/repositories/prisma-entity.repositories";
import { prisma } from "@/lib/prisma";
import { toPriceHistoryDto } from "@/lib/dto";
import {
  createPriceHistorySchema,
  propertyIdParamSchema,
} from "@/lib/validation";

const entityRepos = createEntityRepositories(prisma);

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const parsed = propertyIdParamSchema.safeParse(params);
  if (!parsed.success) {
    return fromServiceResult({
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid property id" },
    });
  }

  const rows = await entityRepos.priceHistory.findByProperty(parsed.data.id);
  return apiSuccess(rows.map(toPriceHistoryDto));
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

  const bodyParsed = await parseBody(request, createPriceHistorySchema);
  if (!bodyParsed.ok) return bodyParsed.response;

  const row = await entityRepos.priceHistory.create(idParsed.data.id, {
    listingId: bodyParsed.data.listingId,
    price: bodyParsed.data.price,
    currency: bodyParsed.data.currency,
    source: bodyParsed.data.source,
    recordedAt: bodyParsed.data.recordedAt,
  });

  return apiSuccess(toPriceHistoryDto(row), undefined, 201);
}
