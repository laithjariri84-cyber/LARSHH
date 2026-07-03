import { NextResponse } from "next/server";

import { listMarketProfiles } from "@/server/market-intelligence";

export async function GET() {
  const profiles = await listMarketProfiles();
  return NextResponse.json({ data: profiles });
}
