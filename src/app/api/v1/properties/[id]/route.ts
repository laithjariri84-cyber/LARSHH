import { NextRequest } from "next/server";

import { fromServiceResult } from "@/lib/api/response";
import { parseBody, parseQuery } from "@/lib/api/parse-request";
import { getPropertyService } from "@/lib/api/services";
import {
  propertyIdParamSchema,
  propertySearchQuerySchema,
  updatePropertyCoreSchema,
} from "@/lib/validation";
import type { PropertyLoadProfile } from "@/domain/property";

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

  const queryParsed = parseQuery(
    request.nextUrl.searchParams,
    propertySearchQuerySchema.pick({ profile: true })
  );
  const profile = (
    queryParsed.ok ? queryParsed.data.profile : undefined
  ) as PropertyLoadProfile | undefined;

  const service = getPropertyService();
  const result = await service.getById(idParsed.data.id, {
    profile: profile ?? "detail",
  });
  return fromServiceResult(result);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const idParsed = propertyIdParamSchema.safeParse(params);
  if (!idParsed.success) {
    return fromServiceResult({
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid property id" },
    });
  }

  const bodyParsed = await parseBody(request, updatePropertyCoreSchema);
  if (!bodyParsed.ok) return bodyParsed.response;

  const service = getPropertyService();
  const result = await service.update(idParsed.data.id, {
    core: bodyParsed.data,
  });
  return fromServiceResult(result);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const idParsed = propertyIdParamSchema.safeParse(params);
  if (!idParsed.success) {
    return fromServiceResult({
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid property id" },
    });
  }

  const service = getPropertyService();
  const result = await service.remove(idParsed.data.id);
  return fromServiceResult(result);
}
