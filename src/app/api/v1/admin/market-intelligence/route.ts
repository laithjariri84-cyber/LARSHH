import { NextResponse } from "next/server";

import { requireMarketIntelligenceAdmin } from "@/lib/market-intelligence-admin-auth";
import { listMarketProfiles } from "@/server/market-intelligence";

export async function GET() {
  try {
    await requireMarketIntelligenceAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const profiles = await listMarketProfiles();
    const bySlug = new Map<
      string,
      { slug: string; name: string; profileCount: number }
    >();

    for (const profile of profiles) {
      const existing = bySlug.get(profile.communitySlug);
      if (existing) {
        existing.profileCount += 1;
      } else {
        bySlug.set(profile.communitySlug, {
          slug: profile.communitySlug,
          name: profile.communityName,
          profileCount: 1,
        });
      }
    }

    const communities = Array.from(bySlug.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return NextResponse.json({ data: communities });
  } catch (error) {
    console.error("[admin/market-intelligence] GET list failed:", error);
    return NextResponse.json({ data: [] });
  }
}
