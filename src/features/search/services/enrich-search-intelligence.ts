import {
  normalizeBedroomCount,
  resolveCommunitySlug,
} from "@/server/market-intelligence/community-matcher";
import { listMarketRoiProfiles } from "@/server/market-intelligence/market-intelligence.repository";

import type { PropertySearchResult } from "../types";

export async function enrichSearchResultsWithMarketIntelligence(
  results: PropertySearchResult[]
): Promise<PropertySearchResult[]> {
  if (results.length === 0) return results;

  const profiles = await listMarketRoiProfiles();
  const profileByKey = new Map(
    profiles.map((profile) => [
      `${profile.communitySlug}:${profile.bedroomCount}`,
      profile,
    ])
  );

  return results.map((result) => {
    const slug = resolveCommunitySlug(result.community);
    if (!slug) {
      return result;
    }

    const bedroomCount = normalizeBedroomCount(result.bedrooms);
    const profile = profileByKey.get(`${slug}:${bedroomCount}`);

    return {
      ...result,
      estimatedRoiPercent: profile?.estimatedRoiPercent ?? null,
    };
  });
}
