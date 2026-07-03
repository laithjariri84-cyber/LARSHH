import { fromServiceResult } from "@/lib/api/response";
import { getPropertyService } from "@/lib/api/services";
import { propertyIdParamSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const params = await context.params;
  const parsed = propertyIdParamSchema.safeParse(params);
  if (!parsed.success) {
    return fromServiceResult({
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid property id" },
    });
  }

  const service = getPropertyService();
  const result = await service.refreshMarketIntelligence(parsed.data.id);
  return fromServiceResult(result);
}
