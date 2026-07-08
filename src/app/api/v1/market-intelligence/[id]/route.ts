import { NextResponse } from "next/server";
import { z } from "zod";

import { requireMarketIntelligenceAdmin } from "@/lib/market-intelligence-admin-auth";
import { CACHE_TAGS } from "@/lib/server-cache";
import { updateMarketProfile } from "@/server/market-intelligence";
import { revalidateTag } from "next/cache";

const updateSchema = z.object({
  rentFurnishedMin: z.number().nullable().optional(),
  rentFurnishedAvg: z.number().nullable().optional(),
  rentFurnishedMax: z.number().nullable().optional(),
  rentFurnishedEstimated: z.boolean().optional(),
  rentUnfurnishedMin: z.number().nullable().optional(),
  rentUnfurnishedAvg: z.number().nullable().optional(),
  rentUnfurnishedMax: z.number().nullable().optional(),
  rentUnfurnishedEstimated: z.boolean().optional(),
  saleAskingLowest: z.number().nullable().optional(),
  saleAskingAvg: z.number().nullable().optional(),
  saleAskingHighest: z.number().nullable().optional(),
  saleAskingEstimated: z.boolean().optional(),
  saleSoldLowest: z.number().nullable().optional(),
  saleSoldAvg: z.number().nullable().optional(),
  saleSoldHighest: z.number().nullable().optional(),
  saleSoldEstimated: z.boolean().optional(),
  averageSizeSqft: z.number().nullable().optional(),
  averagePricePerSqft: z.number().nullable().optional(),
  estimatedRoiPercent: z.number().nullable().optional(),
  demand: z.enum(["LOW", "MEDIUM", "HIGH"]).nullable().optional(),
  confidencePercent: z.number().nullable().optional(),
  isEstimated: z.boolean().optional(),
  notes: z.string().nullable().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireMarketIntelligenceAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const profile = await updateMarketProfile(id, parsed.data);
  revalidateTag(CACHE_TAGS.marketProfiles);
  revalidateTag(CACHE_TAGS.marketRoiProfiles);
  revalidateTag(CACHE_TAGS.communityIntelligenceCms);

  return NextResponse.json({ data: profile });
}
