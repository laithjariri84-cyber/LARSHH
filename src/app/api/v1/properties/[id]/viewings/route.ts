import { NextRequest } from "next/server";

import { apiSuccess, fromServiceResult } from "@/lib/api/response";
import { parseBody } from "@/lib/api/parse-request";
import { getRepositories } from "@/lib/api/services";
import { createViewingSchema, propertyIdParamSchema } from "@/lib/validation";

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
  const viewings = await repos.propertyChildren.viewings.findByProperty(
    parsed.data.id
  );
  return apiSuccess(viewings);
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

  const bodyParsed = await parseBody(request, createViewingSchema);
  if (!bodyParsed.ok) return bodyParsed.response;

  const repos = getRepositories();
  const viewing = await repos.propertyChildren.viewings.create(
    idParsed.data.id,
    {
      listingId: bodyParsed.data.listingId,
      agentId: bodyParsed.data.agentId,
      buyerId: bodyParsed.data.buyerId ?? null,
      tenantId: bodyParsed.data.tenantId ?? null,
      scheduledAt: bodyParsed.data.scheduledAt,
      durationMinutes: bodyParsed.data.durationMinutes ?? 60,
      status: bodyParsed.data.status ?? "SCHEDULED",
      notes: bodyParsed.data.notes ?? null,
    }
  );

  return apiSuccess(viewing, undefined, 201);
}
