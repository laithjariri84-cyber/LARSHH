import { fromServiceResult } from "@/lib/api/response";
import { getPropertyService } from "@/lib/api/services";

export async function GET() {
  const service = getPropertyService();
  const result = await service.getSearchFilterOptions();
  return fromServiceResult(result);
}
