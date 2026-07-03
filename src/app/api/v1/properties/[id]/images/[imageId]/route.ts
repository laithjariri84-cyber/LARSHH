import { NextRequest } from "next/server";

import { fromServiceResult } from "@/lib/api/response";
import {
  deletePropertyImage,
  setPropertyCoverImage,
} from "@/lib/services/property-image.service";

type RouteContext = { params: Promise<{ id: string; imageId: string }> };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id, imageId } = await context.params;
  const result = await deletePropertyImage(id, imageId);
  return fromServiceResult(result);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id, imageId } = await context.params;
  const body = (await request.json()) as { action?: string };

  if (body.action === "set-cover") {
    const result = await setPropertyCoverImage(id, imageId);
    return fromServiceResult(result);
  }

  return fromServiceResult({
    ok: false,
    error: { code: "VALIDATION_ERROR", message: "Unsupported action" },
  });
}
