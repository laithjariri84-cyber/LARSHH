import { NextRequest } from "next/server";

import { apiSuccess, fromServiceResult } from "@/lib/api/response";
import { parseBody } from "@/lib/api/parse-request";
import { getRepositories } from "@/lib/api/services";
import { createListingSchema, propertyIdParamSchema } from "@/lib/validation";

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
  const current = await repos.propertyChildren.listings.getCurrent(parsed.data.id);
  const previous = await repos.propertyChildren.listings.getPrevious(parsed.data.id);
  return apiSuccess({ current, previous });
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

  const bodyParsed = await parseBody(request, createListingSchema);
  if (!bodyParsed.ok) return bodyParsed.response;

  const repos = getRepositories();
  const listing = await repos.propertyChildren.listings.create(
    idParsed.data.id,
    {
      marketingTitle: bodyParsed.data.marketingTitle,
      description: bodyParsed.data.description ?? null,
      askingPrice: bodyParsed.data.askingPrice,
      currency: bodyParsed.data.currency ?? "AED",
      listingType: bodyParsed.data.listingType,
      status: bodyParsed.data.status ?? "DRAFT",
      agentId: bodyParsed.data.agentId,
      publishedAt: bodyParsed.data.publishedAt ?? null,
      expiresAt: bodyParsed.data.expiresAt ?? null,
      pfExpertReference: bodyParsed.data.pfExpertReference ?? null,
      salesforceId: bodyParsed.data.salesforceId ?? null,
      qualityScore: bodyParsed.data.qualityScore ?? null,
      soldAt: null,
      daysOnMarket: null,
      pricePerSqft: null,
      marketDifferencePercent: null,
    }
  );
  return apiSuccess(listing, undefined, 201);
}
