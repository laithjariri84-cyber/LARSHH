import { NextResponse } from "next/server";
import { z } from "zod";

import { requireMarketIntelligenceAdmin } from "@/lib/market-intelligence-admin-auth";
import {
  deleteCommunityIntelligenceCms,
  getCommunityIntelligenceCmsByCommunityId,
  upsertCommunityIntelligenceCms,
} from "@/server/market-intelligence/cms";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/server-cache";

const nearbySchema = z.object({
  title: z.string(),
  meta: z.string().optional(),
});

const upsertSchema = z.object({
  communityName: z.string().min(1),
  overview: z.string().nullable().optional(),
  investmentSummary: z.string().nullable().optional(),
  bestFor: z.string().nullable().optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  marketNotes: z.string().nullable().optional(),
  averageSalePriceAed: z.number().nullable().optional(),
  averageRentAedYear: z.number().nullable().optional(),
  averagePricePerSqftAed: z.number().nullable().optional(),
  averageRoiPercent: z.number().nullable().optional(),
  capitalAppreciationPercent: z.number().nullable().optional(),
  rentalDemand: z.enum(["LOW", "MEDIUM", "HIGH"]).nullable().optional(),
  occupancyRatePercent: z.number().nullable().optional(),
  luxuryScore: z.number().int().min(1).max(10).nullable().optional(),
  familyScore: z.number().int().min(1).max(10).nullable().optional(),
  investmentScore: z.number().int().min(1).max(10).nullable().optional(),
  lifestyleScore: z.number().int().min(1).max(10).nullable().optional(),
  walkability: z.string().nullable().optional(),
  beachAccess: z.string().nullable().optional(),
  shortTermRentalScore: z.number().int().min(1).max(10).nullable().optional(),
  longTermRentalScore: z.number().int().min(1).max(10).nullable().optional(),
  nearbySchools: z.array(nearbySchema).optional(),
  nearbyHospitals: z.array(nearbySchema).optional(),
  nearbyRestaurants: z.array(nearbySchema).optional(),
  nearbySupermarkets: z.array(nearbySchema).optional(),
  nearbyHotels: z.array(nearbySchema).optional(),
  nearbyShopping: z.array(nearbySchema).optional(),
  hiddenMarketInsights: z.string().nullable().optional(),
  futureDevelopments: z.string().nullable().optional(),
  thingsBuyersShouldKnow: z.string().nullable().optional(),
  thingsInvestorsShouldKnow: z.string().nullable().optional(),
  unitTypes: z
    .array(
      z.object({
        unitType: z.enum([
          "STUDIO",
          "ONE_BEDROOM",
          "TWO_BEDROOM",
          "THREE_BEDROOM",
          "FOUR_BEDROOM",
          "TOWNHOUSE",
          "VILLA",
        ]),
        averageSalePriceAed: z.number().nullable().optional(),
        averageRentAedYear: z.number().nullable().optional(),
        averagePricePerSqftAed: z.number().nullable().optional(),
      })
    )
    .optional(),
});

type RouteContext = {
  params: Promise<{ communityId: string }>;
};

async function guardAdmin() {
  try {
    return await requireMarketIntelligenceAdmin();
  } catch {
    return null;
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await guardAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { communityId } = await context.params;
  const record = await getCommunityIntelligenceCmsByCommunityId(communityId);
  if (!record) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  return NextResponse.json({ data: record });
}

export async function PUT(request: Request, context: RouteContext) {
  const user = await guardAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { communityId } = await context.params;
  const body = await request.json();
  const parsed = upsertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const record = await upsertCommunityIntelligenceCms(
    communityId,
    parsed.data,
    {
      email: user.email ?? "unknown",
      name:
        (typeof user.user_metadata?.full_name === "string" &&
          user.user_metadata.full_name) ||
        user.email?.split("@")[0] ||
        "Admin",
    }
  );

  revalidateTag(CACHE_TAGS.marketProfiles);
  revalidateTag(CACHE_TAGS.marketRoiProfiles);
  revalidateTag(CACHE_TAGS.communityIntelligenceCms);

  return NextResponse.json({ data: record });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await guardAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { communityId } = await context.params;
  await deleteCommunityIntelligenceCms(communityId);

  revalidateTag(CACHE_TAGS.marketProfiles);
  revalidateTag(CACHE_TAGS.marketRoiProfiles);
  revalidateTag(CACHE_TAGS.communityIntelligenceCms);

  return NextResponse.json({ success: true });
}
