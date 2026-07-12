import { NextResponse } from "next/server";

import { requireMarketIntelligenceAdmin } from "@/lib/market-intelligence-admin-auth";
import { listCommunitiesForCms } from "@/server/market-intelligence/cms";

export async function GET() {
  try {
    await requireMarketIntelligenceAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const communities = await listCommunitiesForCms();
    return NextResponse.json({ data: communities });
  } catch (error) {
    console.error("[admin/market-intelligence] GET list failed:", error);
    return NextResponse.json(
      { error: "Failed to load communities" },
      { status: 500 }
    );
  }
}
