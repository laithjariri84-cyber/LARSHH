import {
  Furnishing,
  ListingStatus,
  ListingType,
  PropertyType,
  ViewType,
} from "@prisma/client";

import type { SearchFiltersInput } from "../schemas/search-filters.schema";
import type { SmartSearchSort } from "../schemas/smart-search.schema";
import type {
  DetectedFilter,
  SmartSearchContext,
  SmartSearchParseResult,
} from "./smart-search.types";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatAedChip(amount: number, direction: "max" | "min"): string {
  const formatted = amount.toLocaleString("en-US");
  return direction === "max" ? `AED ≤ ${formatted}` : `AED ≥ ${formatted}`;
}

function parseMoneyPhrase(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").replace(/\baed\b/gi, "").trim().toLowerCase();

  const millionWords = cleaned.match(/^([\d.]+)\s+million$/);
  if (millionWords) {
    const amount = Number(millionWords[1]);
    return Number.isNaN(amount) ? null : Math.round(amount * 1_000_000);
  }

  const billionWords = cleaned.match(/^([\d.]+)\s+billion$/);
  if (billionWords) {
    const amount = Number(billionWords[1]);
    return Number.isNaN(amount) ? null : Math.round(amount * 1_000_000_000);
  }

  const compact = cleaned.match(/^([\d.]+)\s*(k|m|mil|million|bn|billion)?$/i);
  if (!compact) return null;

  let amount = Number(compact[1]);
  if (Number.isNaN(amount)) return null;

  const suffix = compact[2]?.toLowerCase();
  if (suffix === "k") amount *= 1_000;
  if (suffix === "m" || suffix === "mil" || suffix === "million") amount *= 1_000_000;
  if (suffix === "bn" || suffix === "billion") amount *= 1_000_000_000;

  return Math.round(amount);
}

function extractBoundedPrice(
  query: string,
  direction: "max" | "min"
): number | null {
  const prefixes =
    direction === "max"
      ? ["under", "below", "less than", "upto", "up to", "max", "maximum", "at most"]
      : ["over", "above", "more than", "from", "min", "minimum", "at least"];

  for (const prefix of prefixes) {
    const pattern = new RegExp(
      `\\b${prefix}\\s+(?:aed\\s*)?([\\d.,]+(?:\\s*(?:k|m|mil|million|bn|billion|aed))?(?:\\s+million|\\s+billion)?)`,
      "i"
    );
    const match = query.match(pattern);
    if (!match) continue;

    const matchStart = match.index ?? 0;
    const before = query.slice(Math.max(0, matchStart - 12), matchStart);
    const after = query.slice(matchStart + match[0].length, matchStart + match[0].length + 12);

    if (
      direction === "min" &&
      /roi|yield/.test(before)
    ) {
      continue;
    }

    if (
      /^\s*(?:aed\s*)?(?:\/|per\s*)sq\.?\s*ft|^\s*per\s+sqft|^\s*sqft\s*price|^\s*aed\s+per/i.test(
        after
      )
    ) {
      continue;
    }

    const amount = parseMoneyPhrase(match[1]);
    if (amount !== null) return amount;
  }

  return null;
}

function isPricePerSqftContext(fragment: string): boolean {
  return /(?:aed\s*)?(?:\/|per\s*)sq\.?\s*ft|sqft\s*price|price\s*(?:per\s*)?sq\.?\s*ft|aed\/sqft|aed per sqft|per sqft/i.test(
    fragment
  );
}

function extractPricePerSqftBounds(query: string): {
  min?: number;
  max?: number;
} {
  const bounds: { min?: number; max?: number } = {};

  const maxPatterns = [
    /(?:under|below|less than|max|at most)\s+(?:aed\s*)?([\d,]+)\s*(?:aed\s*)?(?:\/|per\s*)sq\.?\s*ft/i,
    /(?:under|below|less than)\s+(?:aed\s*)?([\d,]+)\s+per\s+sqft/i,
    /(?:under|below|less than)\s+(?:aed\s*)?([\d,]+)\s+sq\.?\s*ft\s+price/i,
    /(?:under|below|less than)\s+(?:aed\s*)?([\d,]+)\s+sqft\s+price/i,
    /(?:under|below|less than)\s+(?:aed\s*)?([\d,]+)\s+aed\s+per\s+sq\.?\s*ft/i,
  ];

  for (const pattern of maxPatterns) {
    const match = query.match(pattern);
    if (match) {
      bounds.max = Number(match[1].replace(/,/g, ""));
      break;
    }
  }

  const minPatterns = [
    /(?:over|above|more than|min(?:imum)?|at least)\s+(?:aed\s*)?([\d,]+)\s*(?:aed\s*)?(?:\/|per\s*)sq\.?\s*ft/i,
    /(?:over|above|more than)\s+(?:aed\s*)?([\d,]+)\s+per\s+sqft/i,
    /(?:over|above|more than)\s+(?:aed\s*)?([\d,]+)\s+aed\s+per\s+sq\.?\s*ft/i,
  ];

  for (const pattern of minPatterns) {
    const match = query.match(pattern);
    if (match) {
      bounds.min = Number(match[1].replace(/,/g, ""));
      break;
    }
  }

  return bounds;
}

function extractSizeBounds(query: string): { min?: number; max?: number } {
  const bounds: { min?: number; max?: number } = {};

  const betweenMatch = query.match(
    /between\s+([\d,]+)\s+and\s+([\d,]+)\s+sq\.?\s*ft/i
  );
  if (betweenMatch) {
    return {
      min: Number(betweenMatch[1].replace(/,/g, "")),
      max: Number(betweenMatch[2].replace(/,/g, "")),
    };
  }

  const maxMatch = query.match(
    /(?:below|under|less than|max|at most)\s+([\d,]+)\s+sq\.?\s*ft(?!(\s+price))/i
  );
  if (maxMatch) {
    const fragment = query.slice(
      maxMatch.index ?? 0,
      (maxMatch.index ?? 0) + maxMatch[0].length + 10
    );
    if (!isPricePerSqftContext(fragment)) {
      bounds.max = Number(maxMatch[1].replace(/,/g, ""));
    }
  }

  const minMatch = query.match(
    /(?:above|over|bigger than|more than|min(?:imum)?|at least)\s+([\d,]+)\s+sq\.?\s*ft/i
  );
  if (minMatch) {
    const fragment = query.slice(
      minMatch.index ?? 0,
      (minMatch.index ?? 0) + minMatch[0].length + 10
    );
    if (!isPricePerSqftContext(fragment)) {
      bounds.min = Number(minMatch[1].replace(/,/g, ""));
    }
  }

  return bounds;
}

function extractPriceRange(query: string): { min?: number; max?: number } {
  const betweenMatch = query.match(
    /between\s+(?:aed\s*)?([\d.,kmb million]+)\s+and\s+(?:aed\s*)?([\d.,kmb million]+)/i
  );
  if (!betweenMatch) return {};

  const after = query.slice(
    (betweenMatch.index ?? 0) + betweenMatch[0].length
  );
  if (/^\s*sq\.?\s*ft/i.test(after)) return {};

  const min = parseMoneyPhrase(betweenMatch[1]);
  const max = parseMoneyPhrase(betweenMatch[2]);
  if (min === null || max === null) return {};

  return { min: Math.min(min, max), max: Math.max(min, max) };
}

function extractRoiMin(query: string): number | null {
  const thresholdMatch = query.match(
    /(?:roi|yield|rental yield)\s+(?:above|over|at least|min(?:imum)?)\s+([\d.]+)\s*%?/i
  );
  if (thresholdMatch) {
    return Number(thresholdMatch[1]);
  }

  const altMatch = query.match(
    /(?:above|over|at least)\s+([\d.]+)\s*%?\s*(?:roi|yield|rental yield)/i
  );
  if (altMatch) {
    return Number(altMatch[1]);
  }

  return null;
}

type OfferingIntent = {
  type: ListingType;
  weight: number;
  phrase: string;
};

const RENT_INTENTS: OfferingIntent[] = [
  { type: ListingType.RENT, weight: 10, phrase: "for rent" },
  { type: ListingType.RENT, weight: 9, phrase: "to rent" },
  { type: ListingType.RENT, weight: 8, phrase: "for lease" },
  { type: ListingType.RENT, weight: 8, phrase: "to lease" },
  { type: ListingType.RENT, weight: 7, phrase: "leasing" },
  { type: ListingType.RENT, weight: 7, phrase: "rental" },
  { type: ListingType.RENT, weight: 6, phrase: "lease" },
  { type: ListingType.RENT, weight: 6, phrase: "rent" },
];

const SALE_INTENTS: OfferingIntent[] = [
  { type: ListingType.SALE, weight: 10, phrase: "for sale" },
  { type: ListingType.SALE, weight: 9, phrase: "to buy" },
  { type: ListingType.SALE, weight: 8, phrase: "buying" },
  { type: ListingType.SALE, weight: 8, phrase: "purchase" },
  { type: ListingType.SALE, weight: 7, phrase: "buy" },
  { type: ListingType.SALE, weight: 6, phrase: "sale" },
];

function detectOfferingType(query: string): OfferingIntent | null {
  let best: OfferingIntent | null = null;

  for (const intent of [...RENT_INTENTS, ...SALE_INTENTS]) {
    const pattern = new RegExp(`\\b${intent.phrase.replace(/\s+/g, "\\s+")}\\b`, "i");
    if (!pattern.test(query)) continue;
    if (!best || intent.weight > best.weight) {
      best = intent;
    }
  }

  return best;
}

function tokenize(query: string): string[] {
  return query.split(/\s+/).filter(Boolean);
}

function matchLocation(
  query: string,
  context: SmartSearchContext
): {
  communityId?: string;
  buildingId?: string;
  detected: DetectedFilter[];
} {
  const detected: DetectedFilter[] = [];
  let communityId: string | undefined;
  let buildingId: string | undefined;
  const tokens = tokenize(query);

  const buildingAliases: Record<string, string[]> = {
    "royal breeze": ["royal breeze", "royal breeze residences"],
    pacific: ["pacific", "pacific residence", "pacific residences"],
    marina: ["marina residences", "marina residence"],
    "bab al bahr": ["bab al bahr", "bab-al-bahr", "babalbahr"],
  };

  for (const building of context.buildings) {
    const label = building.label.toLowerCase();
    if (query.includes(label)) {
      buildingId = building.value;
      detected.push({
        key: "buildingId",
        label: "Building",
        value: building.label,
        chip: building.label,
      });
      break;
    }

    for (const [needle, patterns] of Object.entries(buildingAliases)) {
      if (
        label.includes(needle) &&
        patterns.some((pattern) => query.includes(pattern))
      ) {
        buildingId = building.value;
        detected.push({
          key: "buildingId",
          label: "Building",
          value: building.label,
          chip: building.label,
        });
        break;
      }
    }
    if (buildingId) break;
  }

  if (!buildingId) {
    for (const building of context.buildings) {
      const labelTokens = tokenize(building.label.toLowerCase());
      const anchor = labelTokens[0];
      if (anchor && anchor.length >= 4 && tokens.includes(anchor)) {
        buildingId = building.value;
        detected.push({
          key: "buildingId",
          label: "Building",
          value: building.label,
          chip: building.label,
        });
        break;
      }
    }
  }

  for (const community of context.communities) {
    const label = community.label.toLowerCase();
    if (query.includes(label)) {
      communityId = community.value;
      detected.push({
        key: "communityId",
        label: "Community",
        value: community.label,
        chip: community.label,
      });
      break;
    }
  }

  if (!communityId && !buildingId) {
    const communityAliases: Record<string, string[]> = {
      "al hamra": ["al hamra", "al-hamra", "hamra village", "al hamra villas"],
      "royal breeze": ["royal breeze"],
      marina: ["marina", "dubai marina"],
      pacific: ["pacific", "pacific residence", "pacific residences"],
      "bab al bahr": ["bab al bahr", "bab-al-bahr", "babalbahr"],
    };

    for (const community of context.communities) {
      const label = community.label.toLowerCase();
      for (const [needle, patterns] of Object.entries(communityAliases)) {
        if (
          patterns.some((pattern) => query.includes(pattern)) &&
          label.includes(needle)
        ) {
          communityId = community.value;
          detected.push({
            key: "communityId",
            label: "Community",
            value: community.label,
            chip: community.label,
          });
          break;
        }
      }
      if (communityId) break;
    }
  }

  return { communityId, buildingId, detected };
}

export function parseSmartSearchQuery(
  rawQuery: string,
  context: SmartSearchContext
): SmartSearchParseResult {
  const query = normalize(rawQuery);
  const filters: SearchFiltersInput = {};
  const detected: DetectedFilter[] = [];
  const detectedKeys = new Set<string>();
  let sort: SmartSearchSort | undefined;

  function addDetected(
    key: string,
    label: string,
    value: string,
    chip?: string
  ) {
    detectedKeys.add(key);
    detected.push({ key, label, value, chip: chip ?? value });
  }

  if (!query) {
    return { filters, detected, detectedKeys: [], unmatchedTerms: [] };
  }

  const offering = detectOfferingType(query);
  if (offering) {
    filters.listingType = offering.type;
    addDetected(
      "listingType",
      "Offering Type",
      offering.type === ListingType.SALE ? "Sale" : "Rent",
      offering.type
    );
  }

  if (/(newest|latest|recent)\s+(listing|listings|properties)?/.test(query)) {
    sort = "newest";
    addDetected("sort", "Sort", "Newest listings", "Newest");
  }

  if (/(oldest|earliest)\s+(listing|listings|properties)?/.test(query)) {
    sort = "oldest";
    addDetected("sort", "Sort", "Oldest listings", "Oldest");
  }

  if (
    /(lowest|cheapest)\s+(aed\s*)?(price\s*)?(per\s*)?sq\.?\s*ft/.test(query) ||
    /lowest price per sqft|cheapest per sqft|lowest aed\/sqft/.test(query)
  ) {
    sort = "price_sqft_asc";
    addDetected("sort", "Sort", "Lowest AED per sqft", "Lowest AED/sqft");
  }

  if (
    /(highest|most expensive|expensive per sqft)\s+(aed\s*)?(price\s*)?(per\s*)?sq\.?\s*ft/.test(
      query
    ) ||
    /highest price per sqft/.test(query)
  ) {
    sort = "price_sqft_desc";
    addDetected("sort", "Sort", "Highest AED per sqft", "Highest AED/sqft");
  }

  if (
    /(highest roi|best investment|highest rental yield|best value investment)/.test(
      query
    )
  ) {
    sort = "roi_desc";
    addDetected("sort", "Sort", "Highest ROI", "Highest ROI");
  }

  if (/\bbest value\b/.test(query) && !/investment/.test(query)) {
    sort = "best_value";
    addDetected("sort", "Sort", "Best value", "Best Value");
  }

  if (/(lowest price|cheapest)(?!.*sq\.?\s*ft)/.test(query)) {
    sort = "price_asc";
    addDetected("sort", "Sort", "Lowest price", "Lowest Price");
  }

  if (/(highest price|most expensive)(?!.*sq\.?\s*ft)/.test(query)) {
    sort = "price_desc";
    addDetected("sort", "Sort", "Highest price", "Highest Price");
  }

  if (/\bluxury\b/.test(query)) {
    sort = "luxury";
    addDetected("sort", "Sort", "Luxury", "Luxury");
  }

  if (/\binvestment\b/.test(query) && !sort) {
    sort = "roi_desc";
    addDetected("sort", "Sort", "Investment", "Investment");
  }

  if (/price reduced|reduced price|price drop/.test(query)) {
    sort = "newest";
    addDetected("sort", "Sort", "Recently updated (price reduced)", "Price reduced");
  }

  const roiMin = extractRoiMin(query);
  if (roiMin !== null && !Number.isNaN(roiMin)) {
    filters.minRoi = roiMin;
    addDetected(
      "minRoi",
      "ROI",
      `${roiMin}%`,
      `ROI ≥ ${roiMin}%`
    );
  } else if (
    /(highest roi|best investment|highest rental yield)/.test(query) &&
    filters.minRoi === undefined
  ) {
    addDetected("smartInsight", "Investment", "High ROI focus", "Investment");
  }

  if (/owner is motivated|motivated owner|motivated seller/.test(query)) {
    addDetected("smartInsight", "Seller Intent", "Motivated owner", "Motivated owner");
  }

  const studioMatch = query.match(/\b(studio|studios)\b/);
  if (studioMatch) {
    filters.bedrooms = 0;
    filters.propertyType = PropertyType.APARTMENT;
    addDetected("bedrooms", "Bedrooms", "Studio", "Studio");
    addDetected("propertyType", "Property Type", "Apartment", "Apartment");
  }

  const bedroomMatch = query.match(/(\d+)\s*(?:bed(?:room)?s?|br|bhk)\b/);
  if (bedroomMatch && !studioMatch) {
    filters.bedrooms = Number(bedroomMatch[1]);
    addDetected(
      "bedrooms",
      "Bedrooms",
      bedroomMatch[1],
      `${bedroomMatch[1]} Bedrooms`
    );
  }

  const bathroomMatch = query.match(/(\d+(?:\.\d+)?)\s*bath(?:room)?s?\b/);
  if (bathroomMatch) {
    filters.bathrooms = Number(bathroomMatch[1]);
    addDetected(
      "bathrooms",
      "Bathrooms",
      bathroomMatch[1],
      `${bathroomMatch[1]} Bath`
    );
  }

  const pricePerSqftBounds = extractPricePerSqftBounds(query);
  if (pricePerSqftBounds.max !== undefined) {
    filters.maxPricePerSqft = pricePerSqftBounds.max;
    addDetected(
      "maxPricePerSqft",
      "AED/sqft",
      pricePerSqftBounds.max.toLocaleString("en-US"),
      `AED/sqft ≤ ${pricePerSqftBounds.max.toLocaleString("en-US")}`
    );
  }
  if (pricePerSqftBounds.min !== undefined) {
    filters.minPricePerSqft = pricePerSqftBounds.min;
    addDetected(
      "minPricePerSqft",
      "AED/sqft",
      pricePerSqftBounds.min.toLocaleString("en-US"),
      `AED/sqft ≥ ${pricePerSqftBounds.min.toLocaleString("en-US")}`
    );
  }

  const sizeBounds = extractSizeBounds(query);
  if (sizeBounds.min !== undefined) {
    filters.minSize = sizeBounds.min;
    addDetected(
      "minSize",
      "Size",
      `${sizeBounds.min.toLocaleString("en-US")} sqft`,
      `≥ ${sizeBounds.min.toLocaleString("en-US")} sqft`
    );
  }
  if (sizeBounds.max !== undefined) {
    filters.maxSize = sizeBounds.max;
    addDetected(
      "maxSize",
      "Size",
      `${sizeBounds.max.toLocaleString("en-US")} sqft`,
      `≤ ${sizeBounds.max.toLocaleString("en-US")} sqft`
    );
  }

  const priceRange = extractPriceRange(query);
  if (priceRange.min !== undefined && priceRange.max !== undefined) {
    filters.minPrice = priceRange.min;
    filters.maxPrice = priceRange.max;
    addDetected(
      "minPrice",
      "Min Price",
      priceRange.min.toLocaleString("en-US"),
      formatAedChip(priceRange.min, "min")
    );
    addDetected(
      "maxPrice",
      "Max Price",
      priceRange.max.toLocaleString("en-US"),
      formatAedChip(priceRange.max, "max")
    );
  } else {
    const maxPrice = extractBoundedPrice(query, "max");
    if (maxPrice !== null) {
      filters.maxPrice = maxPrice;
      addDetected(
        "maxPrice",
        "Max Price",
        maxPrice.toLocaleString("en-US"),
        formatAedChip(maxPrice, "max")
      );
    }

    const minPrice = extractBoundedPrice(query, "min");
    if (minPrice !== null) {
      filters.minPrice = minPrice;
      addDetected(
        "minPrice",
        "Min Price",
        minPrice.toLocaleString("en-US"),
        formatAedChip(minPrice, "min")
      );
    }
  }

  if (/\bsea view\b|\bocean view\b/.test(query)) {
    filters.view = ViewType.SEA;
    addDetected("view", "View", "Sea", "Sea view");
  } else if (/\bmarina view\b/.test(query)) {
    filters.view = ViewType.SEA;
    addDetected("view", "View", "Marina / Sea", "Marina view");
  } else if (/\bgarden view\b/.test(query)) {
    filters.view = ViewType.GARDEN;
    addDetected("view", "View", "Garden", "Garden view");
  } else if (/\bpool view\b/.test(query)) {
    filters.view = ViewType.POOL;
    addDetected("view", "View", "Pool", "Pool view");
  } else if (/\bcity view\b|\bskyline\b/.test(query)) {
    filters.view = ViewType.CITY;
    addDetected("view", "View", "City", "City view");
  } else if (/\bpark view\b/.test(query)) {
    filters.view = ViewType.PARK;
    addDetected("view", "View", "Park", "Park view");
  }

  if (/\bunfurnished\b/.test(query)) {
    filters.furnishing = Furnishing.UNFURNISHED;
    addDetected("furnishing", "Furnishing", "Unfurnished", "Unfurnished");
  } else if (/\bpartially furnished\b|\bpart furnished\b/.test(query)) {
    filters.furnishing = Furnishing.PARTIALLY_FURNISHED;
    addDetected("furnishing", "Furnishing", "Partially furnished", "Part furnished");
  } else if (/\bfurnished\b/.test(query)) {
    filters.furnishing = Furnishing.FULLY_FURNISHED;
    addDetected("furnishing", "Furnishing", "Furnished", "Furnished");
  }

  if (/\bready to move\b|\bmove.?in ready\b/.test(query)) {
    filters.status = ListingStatus.ACTIVE;
    if (!filters.furnishing) {
      filters.furnishing = Furnishing.FULLY_FURNISHED;
      addDetected("furnishing", "Furnishing", "Furnished", "Furnished");
    }
    addDetected("status", "Status", "Ready to move", "Ready to move");
  }

  if (/\bapartments?\b|\bflats?\b/.test(query) && !studioMatch) {
    filters.propertyType = PropertyType.APARTMENT;
    addDetected("propertyType", "Property Type", "Apartment", "Apartment");
  } else if (/\bvillas?\b/.test(query)) {
    filters.propertyType = PropertyType.VILLA;
    addDetected("propertyType", "Property Type", "Villa", "Villa");
  } else if (/\btownhouses?\b/.test(query)) {
    filters.propertyType = PropertyType.TOWNHOUSE;
    addDetected("propertyType", "Property Type", "Townhouse", "Townhouse");
  } else if (/\bpenthouses?\b/.test(query)) {
    filters.propertyType = PropertyType.PENTHOUSE;
    addDetected("propertyType", "Property Type", "Penthouse", "Penthouse");
  }

  if (/\bwith pool\b|\bproperties with pool\b|\bswimming pool\b/.test(query)) {
    addDetected("smartInsight", "Amenity", "Pool", "Pool");
  }

  if (/\bwith balcony\b|\bproperties with balcony\b|\bbalcony\b/.test(query)) {
    addDetected("smartInsight", "Amenity", "Balcony", "Balcony");
  }

  const location = matchLocation(query, context);
  if (location.communityId) filters.communityId = location.communityId;
  if (location.buildingId) filters.buildingId = location.buildingId;
  for (const item of location.detected) {
    detectedKeys.add(item.key);
    detected.push(item);
  }

  if (!filters.status && /\bactive\b/.test(query)) {
    filters.status = ListingStatus.ACTIVE;
    addDetected("status", "Status", "Active", "Active");
  }

  return {
    filters,
    sort,
    detected,
    detectedKeys: Array.from(detectedKeys),
    unmatchedTerms: [],
  };
}

export function buildSmartSearchUrl(
  query: string,
  context: SmartSearchContext
): string {
  const parsed = parseSmartSearchQuery(query, context);
  const params = new URLSearchParams();

  Object.entries(parsed.filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  if (parsed.sort) params.set("sort", parsed.sort);
  if (query.trim()) params.set("smartQuery", query.trim());
  if (parsed.detectedKeys.length > 0) {
    params.set("detected", parsed.detectedKeys.join(","));
  }

  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}
