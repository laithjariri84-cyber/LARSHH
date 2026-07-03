import { NextRequest } from "next/server";
import { z } from "zod";

import { apiSuccess, validationError } from "@/lib/api/response";
import { importService } from "@/lib/import/services/import.service";
import { IMPORT_FIELD_KEYS } from "@/lib/import/core/field-definitions";

const columnMappingSchema = z
  .record(z.enum(IMPORT_FIELD_KEYS), z.string().nullable())
  .optional();

async function readPreviewInput(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");
    const mappingRaw = formData.get("columnMapping");

    if (!(file instanceof File)) {
      return { error: "CSV file is required" as const };
    }

    let columnMapping;
    if (typeof mappingRaw === "string" && mappingRaw.trim()) {
      const parsed = columnMappingSchema.safeParse(JSON.parse(mappingRaw));
      if (!parsed.success) {
        return { error: "Invalid column mapping" as const };
      }
      columnMapping = parsed.data;
    }

    return {
      csvText: await file.text(),
      fileName: file.name || "upload.csv",
      columnMapping,
    };
  }

  const body = (await request.json()) as {
    csvText?: string;
    fileName?: string;
    columnMapping?: z.infer<typeof columnMappingSchema>;
  };

  if (!body.csvText?.trim()) {
    return { error: "csvText is required" as const };
  }

  const mappingParsed = columnMappingSchema.safeParse(body.columnMapping);
  if (!mappingParsed.success && body.columnMapping !== undefined) {
    return { error: "Invalid column mapping" as const };
  }

  return {
    csvText: body.csvText,
    fileName: body.fileName ?? "upload.csv",
    columnMapping: mappingParsed.data,
  };
}

export async function POST(request: NextRequest) {
  const input = await readPreviewInput(request);
  if ("error" in input) {
    return validationError(input.error ?? "Invalid request");
  }

  try {
    const preview = await importService.preview(
      "pf-expert",
      input.csvText,
      input.fileName,
      input.columnMapping
    );
    return apiSuccess(preview);
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : "Failed to parse CSV"
    );
  }
}
