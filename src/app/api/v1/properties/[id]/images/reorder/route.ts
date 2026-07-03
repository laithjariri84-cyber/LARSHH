import { NextRequest } from "next/server";

import { fromServiceResult, validationError } from "@/lib/api/response";
import { reorderPropertyImages } from "@/lib/services/property-image.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as { orderedIds?: string[] };

  if (!body.orderedIds || !Array.isArray(body.orderedIds)) {
    return validationError("orderedIds array is required");
  }

  const result = await reorderPropertyImages(id, body.orderedIds);
  return fromServiceResult(result);
}
