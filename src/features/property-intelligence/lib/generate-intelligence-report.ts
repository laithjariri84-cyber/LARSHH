import type {
  ComparableListing,
  IntelligenceAnalytics,
  IntelligenceFilters,
  IntelligenceReport,
  SupplyDemandLevel,
  TrendDirection,
} from "../types";

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

function bedroomCount(bedrooms: string): number {
  return bedrooms === "Studio" ? 0 : Number(bedrooms);
}

function filterKey(filters: IntelligenceFilters): string {
  return Object.values(filters).join("|");
}

function basePrice(filters: IntelligenceFilters, seed: number): number {
  const isRent = filters.purpose === "Rent";
  const bedroomMultiplier = 1 + bedroomCount(filters.bedrooms) * 0.2;
  const bathroomMultiplier = 1 + Number(filters.bathrooms) * 0.06;
  const viewMultiplier =
    filters.view === "Sea View"
      ? 1.16
      : filters.view === "Marina View"
        ? 1.12
        : filters.view === "Golf View"
          ? 1.07
          : 1;

  const sizeMid =
    ((Number(filters.sizeMin) || 900) + (Number(filters.sizeMax) || 1400)) / 2;

  const base = isRent
    ? sizeMid * 28 * bedroomMultiplier
    : sizeMid * 1180 * bedroomMultiplier * bathroomMultiplier * viewMultiplier;

  return Math.round(base * (0.94 + seededRandom(seed, 1) * 0.12));
}

function buildScopeLabel(filters: IntelligenceFilters): string {
  return `${filters.community} · ${filters.building} · ${filters.propertyType} · ${filters.purpose}`;
}

function pickTrend(seed: number, index: number): TrendDirection {
  const value = seededRandom(seed, index);
  if (value > 0.62) return "up";
  if (value < 0.32) return "down";
  return "stable";
}

function pickLevel(seed: number, index: number): SupplyDemandLevel {
  const value = seededRandom(seed, index);
  if (value > 0.78) return "Very High";
  if (value > 0.55) return "High";
  if (value > 0.35) return "Balanced";
  return "Low";
}

function generateComparables(
  filters: IntelligenceFilters,
  seed: number,
  averagePrice: number
): ComparableListing[] {
  return Array.from({ length: 8 }, (_, index) => {
    const listingSeed = seed + index * 23;
    const size =
      Math.round(
        ((Number(filters.sizeMin) || 900) + (Number(filters.sizeMax) || 1400)) /
          2 +
          (seededRandom(listingSeed, 2) - 0.5) * 220
      ) || 1200;
    const price = Math.round(
      averagePrice * (0.88 + seededRandom(listingSeed, 3) * 0.24)
    );
    const pricePerSqft = Math.round(price / size);
    const differencePercent = Number(
      ((seededRandom(listingSeed, 4) - 0.5) * 16).toFixed(1)
    );
    const statuses: ComparableListing["status"][] = [
      "Active",
      "Active",
      "Under Offer",
      "Pending",
      "Sold",
    ];

    return {
      id: `${seed}-${index}`,
      building:
        index % 2 === 0
          ? filters.building
          : `${filters.community} Tower ${String.fromCharCode(66 + (index % 2))}`,
      size,
      price,
      pricePerSqft,
      differencePercent,
      status: statuses[index % statuses.length],
    };
  });
}

export function generateIntelligenceAnalytics(
  filters: IntelligenceFilters
): IntelligenceAnalytics {
  const seed = hashString(filterKey(filters));
  const averageAskingPrice = basePrice(filters, seed);
  const spread = averageAskingPrice * (0.08 + seededRandom(seed, 5) * 0.06);
  const lowestAskingPrice = Math.round(averageAskingPrice - spread);
  const highestAskingPrice = Math.round(averageAskingPrice + spread);
  const estimatedMarketValue = Math.round(
    averageAskingPrice * (0.97 + seededRandom(seed, 6) * 0.04)
  );
  const suggestedListingPrice = Math.round(estimatedMarketValue * 1.025);
  const suggestedClosingPrice = Math.round(estimatedMarketValue * 0.985);
  const sizeMid =
    ((Number(filters.sizeMin) || 900) + (Number(filters.sizeMax) || 1400)) / 2;
  const averagePricePerSqft = Math.round(averageAskingPrice / sizeMid);
  const rentalYield = Number(
    (
      ((averageAskingPrice * 0.045) / averageAskingPrice) *
      100 *
      (filters.purpose === "Rent" ? 1.08 : 1)
    ).toFixed(1)
  );
  const averageRoi = Number((rentalYield * 0.92).toFixed(1));
  const holidayHomeScore = Math.round(62 + seededRandom(seed, 7) * 32);
  const investmentScore = Math.round(58 + seededRandom(seed, 8) * 36);

  const report: IntelligenceReport = {
    estimatedMarketValue,
    suggestedListingPrice,
    suggestedClosingPrice,
    averageAskingPrice,
    lowestAskingPrice,
    highestAskingPrice,
    averagePricePerSqft,
    averageRoi,
    averageDaysOnMarket: Math.round(16 + seededRandom(seed, 9) * 38),
    holidayHomeScore,
    investmentScore,
    rentalYield,
    priceTrend: pickTrend(seed, 10),
    marketTrend: pickTrend(seed, 11),
    supplyLevel: pickLevel(seed, 12),
    demandLevel: pickLevel(seed, 13),
    marketConfidence: Math.round(88 + seededRandom(seed, 14) * 10),
  };

  return {
    report,
    comparables: generateComparables(filters, seed, averageAskingPrice),
    scopeLabel: buildScopeLabel(filters),
  };
}

export function formatCurrency(value: number, purpose?: "Rent" | "Sale"): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

  return purpose === "Rent" ? `${formatted}/yr` : formatted;
}

export function formatPercent(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

export function formatTrend(value: TrendDirection): string {
  if (value === "up") return "↑ Rising";
  if (value === "down") return "↓ Softening";
  return "→ Stable";
}

export function formatLevel(value: SupplyDemandLevel): string {
  return value;
}
