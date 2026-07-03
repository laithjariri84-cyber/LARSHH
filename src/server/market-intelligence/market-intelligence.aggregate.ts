import {
  buildCommunityMarketSummary,
  formatRentRange,
  type CommunityMarketSummary,
} from "@/lib/market-intelligence/summary";
import { resolveCommunitySlug } from "@/server/market-intelligence/community-matcher";
import { listMarketProfiles } from "@/server/market-intelligence/market-intelligence.repository";

export type { CommunityMarketSummary } from "@/lib/market-intelligence/summary";
export { buildCommunityMarketSummary, formatRentRange };

export async function getCommunityMarketSummary(
  communitySlug: string,
  bedroomCount?: number
): Promise<CommunityMarketSummary | null> {
  const profiles = await listMarketProfiles();
  const communityProfiles = profiles.filter(
    (profile) => profile.communitySlug === communitySlug
  );

  if (communityProfiles.length === 0) {
    return null;
  }

  const scopedProfiles =
    bedroomCount === undefined
      ? communityProfiles
      : communityProfiles.filter((profile) => profile.bedroomCount === bedroomCount);

  if (scopedProfiles.length === 0) {
    return null;
  }

  return buildCommunityMarketSummary(
    communitySlug,
    scopedProfiles[0]?.communityName ?? communitySlug,
    scopedProfiles
  );
}

export async function listCommunityMarketSummaries(): Promise<
  CommunityMarketSummary[]
> {
  const profiles = await listMarketProfiles();
  const grouped = new Map<string, typeof profiles>();

  for (const profile of profiles) {
    const rows = grouped.get(profile.communitySlug) ?? [];
    rows.push(profile);
    grouped.set(profile.communitySlug, rows);
  }

  return Array.from(grouped.entries())
    .map(([slug, rows]) =>
      buildCommunityMarketSummary(slug, rows[0]?.communityName ?? slug, rows)
    )
    .sort((a, b) => a.communityName.localeCompare(b.communityName));
}

export async function getCommunityMarketSummaryByName(
  communityName: string,
  bedroomCount?: number
): Promise<CommunityMarketSummary | null> {
  const slug = resolveCommunitySlug(communityName);
  if (!slug) return null;
  return getCommunityMarketSummary(slug, bedroomCount);
}
