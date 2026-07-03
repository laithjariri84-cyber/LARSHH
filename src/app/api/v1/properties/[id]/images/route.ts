import { NextRequest } from "next/server";

import { fromServiceResult } from "@/lib/api/response";
import { PROPERTY_IMAGE_LIMITS } from "@/lib/brand";
import {
  listPropertyImages,
  uploadPropertyImages,
} from "@/lib/services/property-image.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const result = await listPropertyImages(id);
  return fromServiceResult(result);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const formData = await request.formData();
  const entries = formData.getAll("files");

  if (!entries.length) {
    return fromServiceResult({
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "No files provided" },
    });
  }

  const files: { buffer: Buffer; mimeType: string; fileName: string }[] = [];

  for (const entry of entries) {
    if (!(entry instanceof File)) continue;
    if (entry.size > PROPERTY_IMAGE_LIMITS.maxFileSizeBytes) {
      return fromServiceResult({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Each image must be 20MB or less",
        },
      });
    }
    files.push({
      buffer: Buffer.from(await entry.arrayBuffer()),
      mimeType: entry.type || "image/jpeg",
      fileName: entry.name,
    });
  }

  const result = await uploadPropertyImages(id, files);
  if (!result.ok) return fromServiceResult(result);

  const list = await listPropertyImages(id);
  return fromServiceResult(list);
}
