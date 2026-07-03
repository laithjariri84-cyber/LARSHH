import { NextRequest } from "next/server";

import { apiSuccess, fromServiceResult } from "@/lib/api/response";
import { parseBody } from "@/lib/api/parse-request";
import { getRepositories } from "@/lib/api/services";
import { createOfferSchema, propertyIdParamSchema } from "@/lib/validation";

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

  const repos = getRepositories();
  const offers = await repos.propertyChildren.offers.findByProperty(parsed.data.id);
  return apiSuccess(offers);
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

  const bodyParsed = await parseBody(request, createOfferSchema);
  if (!bodyParsed.ok) return bodyParsed.response;

  const repos = getRepositories();
  const offer = await repos.propertyChildren.offers.create(idParsed.data.id, {
    listingId: bodyParsed.data.listingId,
    buyerId: bodyParsed.data.buyerId,
    agentId: bodyParsed.data.agentId,
    status: "OFFER",
    offerPrice: bodyParsed.data.offerPrice,
    agreedPrice: null,
    currency: bodyParsed.data.currency ?? "USD",
    openedAt: new Date(),
    closedAt: null,
  });

  return apiSuccess(offer, undefined, 201);
}
