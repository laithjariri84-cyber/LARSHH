import { fromServiceResult } from "@/lib/api/response";
import { getServices } from "@/lib/api/services";
import { uuidSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;
  const parsed = uuidSchema.safeParse(params.id);
  if (!parsed.success) {
    return fromServiceResult({
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid owner id" },
    });
  }

  const result = await getServices().catalog.owners.getPropertyPortfolio(
    parsed.data
  );
  return fromServiceResult(result);
}
