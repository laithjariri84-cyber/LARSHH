import { NextRequest } from "next/server";

import { apiSuccess, validationError } from "@/lib/api/response";
import { importService } from "@/lib/import/services/import.service";

async function readCsvFromRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { error: "CSV file is required" as const };
    }

    return {
      csvText: await file.text(),
      fileName: file.name || "upload.csv",
    };
  }

  const body = (await request.json()) as {
    csvText?: string;
    fileName?: string;
  };

  if (!body.csvText?.trim()) {
    return { error: "csvText is required" as const };
  }

  return {
    csvText: body.csvText,
    fileName: body.fileName ?? "upload.csv",
  };
}

export async function POST(request: NextRequest) {
  const input = await readCsvFromRequest(request);
  if ("error" in input) {
    return validationError(input.error ?? "Invalid request");
  }

  try {
    const result = importService.parseHeaders(input.csvText);
    return apiSuccess(result);
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : "Failed to parse CSV headers"
    );
  }
}
