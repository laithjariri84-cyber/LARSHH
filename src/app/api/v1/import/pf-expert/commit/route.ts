import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

import { apiSuccess, validationError } from "@/lib/api/response";
import { parseBody } from "@/lib/api/parse-request";
import { importService } from "@/lib/import/services/import.service";
import { importCommitSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const parsed = await parseBody(request, importCommitSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const result = await importService.commit(parsed.data);

    if (result.imported > 0) {
      revalidatePath("/search");
      revalidatePath("/properties", "layout");
    }

    return apiSuccess(result);
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : "Import commit failed"
    );
  }
}
