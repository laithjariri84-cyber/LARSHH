import type {
  ComparableListing,
  DistributionBucket,
  MarketAnalytics,
  MarketFilters,
  MarketScore,
  MarketScoreLevel,
  MarketSummary,
  TrendPoint,
} from "../types";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number, index: number): number {
  const value = Math.sin(seed * 9999 + index * 7919) * 10000;
  return value - Math.floor(value);
}

function filterKey(filters: MarketFilters): string {
  return Object.values(filters).join("|");
}

function bedroomCount(bedrooms: string): number {
  return bedrooms === "Studio" ? 0 : Number(bedrooms);
}

function basePrice(filters: MarketFilters, seed: number): number {
  const bedroomMultiplier = 1 + bedroomCount(filters.bedrooms) * 0.22;
  const typeMultiplier =
    filters.propertyType === "Penthouse"
      ? 2.4
      : filters.propertyType === "Villa"
        ? 2.1
        : filters.propertyType === "Townhouse"
          ? 1.7
          : filters.propertyType === "3 Bedroom"
            ? 1.45
            : filters.propertyType === "2 Bedroom"
              ? 1.15
              : filters.propertyType === "1 Bedroom"
                ? 0.92
                : 0.72;

  const viewMultiplier =
    filters.view === "Sea View"
      ? 1.18
      : filters.view === "Marina View"
        ? 1.14
        : filters.view === "Golf View"
          ? 1.08
          : 1;

  const masterMultiplier =
    filters.masterCommunity === "Al Marjan Island"
      ? 1.12
      : filters.masterCommunity === "Al Hamra Village"
        ? 1.05
        : filters.masterCommunity === "RAK Central"
          ? 0.94
          : 1;

  return (
    920000 *
    bedroomMultiplier *
    typeMultiplier *
    viewMultiplier *
    masterMultiplier *
    (0.92 + seededRandom(seed, 1) * 0.18)
  );
}

function baseSize(filters: MarketFilters, seed: number): number {
  const bedroomSize = bedroomCount(filters.bedrooms) * 420 + 380;
  const typeSize =
    filters.propertyType === "Penthouse"
      ? 900
      : filters.propertyType === "Villa"
        ? 1200
        : filters.propertyType === "Townhouse"
          ? 650
          : 0;

  return Math.round(bedroomSize + typeSize + seededRandom(seed, 2) * 280);
}

function generateComparables(
  filters: MarketFilters,
  seed: number
): ComparableListing[] {
  const statuses: ComparableListing["status"][] = [
    "Active",
    "Active",
    "Active",
    "Under Offer",
    "Pending",
    "Sold",
  ];

  return Array.from({ length: 10 }, (_, index) => {
    const listingSeed = seed + index * 17;
    const price = Math.round(basePrice(filters, listingSeed));
    const size = baseSize(filters, listingSeed);
    const pricePerSqft = Math.round(price / size);
    const marketDelta = (seededRandom(listingSeed, 3) - 0.52) * 18;
    const propertyCode = `${filters.community
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 3)
      .toUpperCase()}-${1200 + index * 7}`;

    return {
      id: `${seed}-${index}`,
      property: propertyCode,
      building: filters.building,
      price,
      size,
      pricePerSqft,
      differencePercent: Number(marketDelta.toFixed(1)),
      status: statuses[index % statuses.length],
    };
  });
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
  }
  return sorted[middle];
}

function buildSummary(
  filters: MarketFilters,
  comparables: ComparableListing[],
  seed: number
): MarketSummary {
  const prices = comparables.map((item) => item.price);
  const sqftValues = comparables.map((item) => item.pricePerSqft);
  const averageAskingPrice = Math.round(
    prices.reduce((sum, value) => sum + value, 0) / prices.length
  );
  const averagePricePerSqft = Math.round(
    sqftValues.reduce((sum, value) => sum + value, 0) / sqftValues.length
  );
  const averageRent = Math.round(
    averageAskingPrice * (0.042 + seededRandom(seed, 10) * 0.012)
  );
  const averageRoi = Number(
    ((averageRent / averageAskingPrice) * 100).toFixed(1)
  );

  return {
    averageAskingPrice,
    averageRent,
    averagePricePerSqft,
    averageRoi,
    lowestListing: Math.min(...prices),
    highestListing: Math.max(...prices),
    medianPrice: median(prices),
    activeListings: comparables.filter((item) => item.status === "Active").length,
    averageDaysOnMarket: Math.round(18 + seededRandom(seed, 11) * 42),
  };
}

function buildDistribution(comparables: ComparableListing[]): DistributionBucket[] {
  const buckets = [
    { label: "< $1.0M", min: 0, max: 1_000_000 },
    { label: "$1.0M – $1.5M", min: 1_000_000, max: 1_500_000 },
    { label: "$1.5M – $2.0M", min: 1_500_000, max: 2_000_000 },
    { label: "$2.0M – $2.5M", min: 2_000_000, max: 2_500_000 },
    { label: "$2.5M+", min: 2_500_000, max: Number.MAX_SAFE_INTEGER },
  ];

  const counts = buckets.map((bucket) =>
    comparables.filter(
      (item) => item.price >= bucket.min && item.price < bucket.max
    ).length
  );
  const total = comparables.length || 1;

  return buckets.map((bucket, index) => ({
    label: bucket.label,
    count: counts[index],
    percentage: Math.round((counts[index] / total) * 100),
  }));
}

function buildTrend(
  baseValue: number,
  seed: number,
  volatility: number
): TrendPoint[] {
  return MONTHS.map((label, index) => {
    const seasonal = Math.sin((index / 12) * Math.PI * 2) * volatility;
    const drift = index * (volatility * 0.08);
    const noise = (seededRandom(seed, index + 20) - 0.5) * volatility * 0.6;
    return {
      label,
      value: Math.round(baseValue + seasonal + drift + noise),
    };
  });
}

function resolveMarketScore(summary: MarketSummary): MarketScore {
  let level: MarketScoreLevel = "average";
  let headline = "Average";
  let rationale =
    "Pricing is broadly aligned with the current micro-market benchmark.";

  if (summary.averageRoi >= 6.8 && summary.averagePricePerSqft <= 1150) {
    level = "excellent_investment";
    headline = "Excellent Investment";
    rationale =
      "Strong rental yield with favorable price-per-square-foot positioning versus comparable inventory.";
  } else if (summary.averageRoi >= 5.8) {
    level = "good_investment";
    headline = "Good Investment";
    rationale =
      "Healthy yield profile with stable absorption and limited downside pricing risk.";
  } else if (summary.averagePricePerSqft >= 1350 || summary.averageRoi <= 4.8) {
    level = "overpriced_area";
    headline = "Overpriced Area";
    rationale =
      "Current asking levels appear stretched relative to rental yield and comparable sale benchmarks.";
  }

  const score = Math.min(
    100,
    Math.round(summary.averageRoi * 9 + (summary.activeListings / 10) * 12)
  );

  return { level, score, headline, rationale };
}

export function generateMarketAnalytics(filters: MarketFilters): MarketAnalytics {
  const seed = hashString(filterKey(filters));
  const comparables = generateComparables(filters, seed);
  const summary = buildSummary(filters, comparables, seed);

  return {
    summary,
    priceDistribution: buildDistribution(comparables),
    rentalTrend: buildTrend(summary.averageRent, seed, summary.averageRent * 0.06),
    salesTrend: buildTrend(
      summary.averageAskingPrice,
      seed + 99,
      summary.averageAskingPrice * 0.05
    ),
    marketScore: resolveMarketScore(summary),
    comparables,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}
