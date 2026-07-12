const COMMUNITY_SLUG_MATCHERS: Array<{ pattern: string; slug: string }> = [
  { pattern: "royal breeze", slug: "royal-breeze" },
  { pattern: "bab al bahr", slug: "bab-al-bahr" },
  { pattern: "bab al bahar", slug: "bab-al-bahr" },
  { pattern: "pacific", slug: "pacific" },
  { pattern: "mina al arab", slug: "mina-al-arab-lagoon" },
  { pattern: "marina residences", slug: "marina-residences" },
  { pattern: "bay residences", slug: "bay-residences" },
  { pattern: "gateway residences", slug: "gateway-residences" },
  { pattern: "bermuda", slug: "bermuda" },
  { pattern: "malibu", slug: "malibu" },
  { pattern: "marbella", slug: "marbella" },
  { pattern: "flamingo", slug: "flamingo" },
  { pattern: "golf apartments", slug: "golf-apartments" },
  { pattern: "golf terrace", slug: "golf-terrace" },
  { pattern: "bayti homes", slug: "bayti-homes" },
  { pattern: "al hamra townhouses", slug: "al-hamra-townhouses" },
  { pattern: "hamra townhouses", slug: "al-hamra-townhouses" },
];

export function resolveCommunitySlug(communityName: string): string | null {
  const normalized = communityName.toLowerCase().trim().replace(/-/g, " ");

  for (const matcher of COMMUNITY_SLUG_MATCHERS) {
    if (normalized.includes(matcher.pattern)) {
      return matcher.slug;
    }
  }

  return null;
}

export function normalizeBedroomCount(bedrooms: number | null | undefined): number {
  if (bedrooms === null || bedrooms === undefined || bedrooms < 0) {
    return 0;
  }

  return Math.min(Math.max(Math.round(bedrooms), 0), 5);
}

export function bedroomLabel(count: number): string {
  if (count <= 0) return "Studio";
  if (count === 1) return "1 Bedroom";
  if (count === 2) return "2 Bedroom";
  if (count === 3) return "3 Bedroom";
  if (count === 4) return "4 Bedroom";
  if (count === 5) return "5 Bedroom";
  return "3+ Bedroom";
}

export const MARKET_INTELLIGENCE_COMMUNITIES = [
  { slug: "royal-breeze", name: "Royal Breeze" },
  { slug: "pacific", name: "Pacific" },
  { slug: "bab-al-bahr", name: "Bab Al Bahr" },
  { slug: "mina-al-arab-lagoon", name: "Mina Al Arab Lagoon" },
  { slug: "marina-residences", name: "Marina Residences" },
  { slug: "bay-residences", name: "Bay Residences" },
  { slug: "gateway-residences", name: "Gateway Residences" },
  { slug: "bermuda", name: "Bermuda" },
  { slug: "malibu", name: "Malibu" },
  { slug: "marbella", name: "Marbella" },
  { slug: "flamingo", name: "Flamingo" },
  { slug: "golf-apartments", name: "Golf Apartments" },
  { slug: "golf-terrace", name: "Golf Terrace" },
  { slug: "bayti-homes", name: "Bayti Homes" },
  { slug: "al-hamra-townhouses", name: "Al Hamra Townhouses" },
] as const;
