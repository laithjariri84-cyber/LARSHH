import { NextResponse } from "next/server";

import { requireMarketIntelligenceAdmin } from "@/lib/market-intelligence-admin-auth";
import { listCommunitiesForCms } from "@/server/market-intelligence/cms";

export async function GET() {
  try {
    await requireMarketIntelligenceAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const communities = await listCommunitiesForCms();
  return NextResponse.json({ data: communities });
}
