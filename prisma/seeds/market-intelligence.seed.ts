import type { MarketDemandLevel, Prisma } from "@prisma/client";

export type MarketProfileSeed = {
  communitySlug: string;
  communityName: string;
  bedroomCount: number;
  rentFurnishedMin?: number;
  rentFurnishedAvg?: number;
  rentFurnishedMax?: number;
  rentFurnishedEstimated?: boolean;
  rentUnfurnishedMin?: number;
  rentUnfurnishedAvg?: number;
  rentUnfurnishedMax?: number;
  rentUnfurnishedEstimated?: boolean;
  saleAskingLowest?: number;
  saleAskingAvg?: number;
  saleAskingHighest?: number;
  saleAskingEstimated?: boolean;
  saleSoldLowest?: number;
  saleSoldAvg?: number;
  saleSoldHighest?: number;
  saleSoldEstimated?: boolean;
  averageSizeSqft?: number;
  averagePricePerSqft?: number;
  estimatedRoiPercent?: number;
  demand?: MarketDemandLevel;
  confidencePercent?: number;
  isEstimated?: boolean;
  notes?: string;
};

function soldFromAsking(low?: number, avg?: number, high?: number) {
  if (avg === undefined) return {};
  return {
    saleSoldLowest: low !== undefined ? Math.round(low * 0.9) : undefined,
    saleSoldAvg: Math.round(avg * 0.94),
    saleSoldHighest: high !== undefined ? Math.round(high * 0.96) : undefined,
    saleSoldEstimated: true,
  };
}

function roi(rentAvg?: number, saleAvg?: number) {
  if (!rentAvg || !saleAvg) return undefined;
  return Math.round((rentAvg / saleAvg) * 10000) / 100;
}

function avg(min?: number, max?: number, explicit?: number) {
  if (explicit !== undefined) return explicit;
  if (min !== undefined && max !== undefined) return Math.round((min + max) / 2);
  return min ?? max;
}

function profile(
  input: Omit<
    MarketProfileSeed,
    "saleSoldLowest" | "saleSoldAvg" | "saleSoldHighest" | "saleSoldEstimated"
  > & {
    saleSoldLowest?: number;
    saleSoldAvg?: number;
    saleSoldHighest?: number;
    saleSoldEstimated?: boolean;
  }
): MarketProfileSeed {
  const rentUnfurnishedAvg =
    input.rentUnfurnishedAvg ??
    avg(input.rentUnfurnishedMin, input.rentUnfurnishedMax);
  const saleAskingAvg =
    input.saleAskingAvg ??
    avg(input.saleAskingLowest, input.saleAskingHighest);

  const sold =
    input.saleSoldAvg !== undefined
      ? {
          saleSoldLowest: input.saleSoldLowest,
          saleSoldAvg: input.saleSoldAvg,
          saleSoldHighest: input.saleSoldHighest,
          saleSoldEstimated: input.saleSoldEstimated ?? false,
        }
      : soldFromAsking(
          input.saleAskingLowest,
          saleAskingAvg,
          input.saleAskingHighest
        );

  return {
    ...input,
    rentUnfurnishedAvg,
    saleAskingAvg,
    estimatedRoiPercent:
      input.estimatedRoiPercent ?? roi(rentUnfurnishedAvg, saleAskingAvg),
    ...sold,
  };
}

/** Scale helper for estimated nearby-community profiles. */
function scaleProfile(
  base: MarketProfileSeed,
  slug: string,
  name: string,
  multiplier: number,
  confidence: number,
  notes: string
): MarketProfileSeed {
  const scale = (value?: number) =>
    value !== undefined ? Math.round(value * multiplier) : undefined;

  return profile({
    communitySlug: slug,
    communityName: name,
    bedroomCount: base.bedroomCount,
    rentFurnishedMin: scale(base.rentFurnishedMin),
    rentFurnishedAvg: scale(base.rentFurnishedAvg),
    rentFurnishedMax: scale(base.rentFurnishedMax),
    rentFurnishedEstimated: true,
    rentUnfurnishedMin: scale(base.rentUnfurnishedMin),
    rentUnfurnishedAvg: scale(base.rentUnfurnishedAvg),
    rentUnfurnishedMax: scale(base.rentUnfurnishedMax),
    rentUnfurnishedEstimated: true,
    saleAskingLowest: scale(base.saleAskingLowest),
    saleAskingAvg: scale(base.saleAskingAvg),
    saleAskingHighest: scale(base.saleAskingHighest),
    saleAskingEstimated: true,
    averageSizeSqft: base.averageSizeSqft,
    averagePricePerSqft: base.averagePricePerSqft
      ? Math.round(base.averagePricePerSqft * multiplier)
      : undefined,
    demand: base.demand,
    confidencePercent: confidence,
    isEstimated: true,
    notes,
  });
}

const ROYAL_BREEZE: MarketProfileSeed[] = [
  profile({
    communitySlug: "royal-breeze",
    communityName: "Royal Breeze",
    bedroomCount: 0,
    rentUnfurnishedMin: 25000,
    rentUnfurnishedAvg: 27000,
    rentUnfurnishedMax: 29000,
    rentFurnishedMin: 28000,
    rentFurnishedAvg: 31500,
    rentFurnishedMax: 33000,
    saleAskingLowest: 400000,
    saleAskingAvg: 440000,
    saleAskingHighest: 530000,
    averageSizeSqft: 460,
    averagePricePerSqft: 1100,
    demand: "HIGH",
    confidencePercent: 91,
  }),
  profile({
    communitySlug: "royal-breeze",
    communityName: "Royal Breeze",
    bedroomCount: 1,
    rentUnfurnishedMin: 32000,
    rentUnfurnishedAvg: 34000,
    rentUnfurnishedMax: 36000,
    rentFurnishedMin: 33000,
    rentFurnishedAvg: 35500,
    rentFurnishedMax: 38000,
    saleAskingLowest: 680000,
    saleAskingAvg: 920000,
    saleAskingHighest: 1150000,
    averageSizeSqft: 820,
    averagePricePerSqft: 1125,
    demand: "HIGH",
    confidencePercent: 92,
  }),
  profile({
    communitySlug: "royal-breeze",
    communityName: "Royal Breeze",
    bedroomCount: 2,
    rentUnfurnishedMin: 58000,
    rentUnfurnishedAvg: 61500,
    rentUnfurnishedMax: 65000,
    rentFurnishedMin: 62000,
    rentFurnishedAvg: 66000,
    rentFurnishedMax: 70000,
    rentFurnishedEstimated: true,
    saleAskingLowest: 1180000,
    saleAskingAvg: 1450000,
    saleAskingHighest: 1700000,
    averageSizeSqft: 1325,
    averagePricePerSqft: 1095,
    demand: "LOW",
    confidencePercent: 88,
    notes: "Furnished rent estimated from unfurnished benchmark.",
  }),
  profile({
    communitySlug: "royal-breeze",
    communityName: "Royal Breeze",
    bedroomCount: 3,
    rentUnfurnishedMin: 110000,
    rentUnfurnishedAvg: 130000,
    rentUnfurnishedMax: 150000,
    rentFurnishedMin: 118000,
    rentFurnishedAvg: 138000,
    rentFurnishedMax: 158000,
    rentFurnishedEstimated: true,
    saleAskingLowest: 2050000,
    saleAskingAvg: 2450000,
    saleAskingHighest: 2700000,
    averageSizeSqft: 2500,
    averagePricePerSqft: 980,
    demand: "MEDIUM",
    confidencePercent: 89,
    notes: "Furnished rent estimated from unfurnished benchmark.",
  }),
];

const BAB_AL_BAHR: MarketProfileSeed[] = [
  profile({
    communitySlug: "bab-al-bahr",
    communityName: "Bab Al Bahr",
    bedroomCount: 0,
    rentUnfurnishedMin: 26000,
    rentUnfurnishedAvg: 27000,
    rentUnfurnishedMax: 28000,
    rentFurnishedMin: 31000,
    rentFurnishedAvg: 33000,
    rentFurnishedMax: 35000,
    saleAskingLowest: 650000,
    saleAskingAvg: 685000,
    saleAskingHighest: 720000,
    averageSizeSqft: 480,
    averagePricePerSqft: 1100,
    demand: "HIGH",
    confidencePercent: 87,
  }),
  profile({
    communitySlug: "bab-al-bahr",
    communityName: "Bab Al Bahr",
    bedroomCount: 1,
    rentUnfurnishedMin: 40000,
    rentUnfurnishedAvg: 41500,
    rentUnfurnishedMax: 43000,
    rentFurnishedMin: 44000,
    rentFurnishedAvg: 47000,
    rentFurnishedMax: 50000,
    saleAskingLowest: 900000,
    saleAskingAvg: 1095000,
    saleAskingHighest: 1290000,
    averageSizeSqft: 850,
    averagePricePerSqft: 1150,
    demand: "HIGH",
    confidencePercent: 86,
  }),
  profile({
    communitySlug: "bab-al-bahr",
    communityName: "Bab Al Bahr",
    bedroomCount: 2,
    rentUnfurnishedMin: 56000,
    rentUnfurnishedAvg: 60000,
    rentUnfurnishedMax: 64000,
    rentFurnishedMin: 60000,
    rentFurnishedAvg: 64500,
    rentFurnishedMax: 69000,
    rentUnfurnishedEstimated: true,
    rentFurnishedEstimated: true,
    saleAskingLowest: 1250000,
    saleAskingAvg: 1500000,
    saleAskingHighest: 1750000,
    saleAskingEstimated: true,
    averageSizeSqft: 1280,
    averagePricePerSqft: 1080,
    demand: "MEDIUM",
    confidencePercent: 72,
    isEstimated: true,
    notes: "Estimated from Royal Breeze and Pacific benchmarks.",
  }),
  profile({
    communitySlug: "bab-al-bahr",
    communityName: "Bab Al Bahr",
    bedroomCount: 3,
    rentUnfurnishedMin: 105000,
    rentUnfurnishedAvg: 125000,
    rentUnfurnishedMax: 145000,
    rentFurnishedMin: 112000,
    rentFurnishedAvg: 132000,
    rentFurnishedMax: 152000,
    rentUnfurnishedEstimated: true,
    rentFurnishedEstimated: true,
    saleAskingLowest: 2100000,
    saleAskingAvg: 2500000,
    saleAskingHighest: 2800000,
    saleAskingEstimated: true,
    averageSizeSqft: 2450,
    averagePricePerSqft: 990,
    demand: "MEDIUM",
    confidencePercent: 70,
    isEstimated: true,
    notes: "Estimated from Royal Breeze benchmarks.",
  }),
];

const PACIFIC: MarketProfileSeed[] = [
  profile({
    communitySlug: "pacific",
    communityName: "Pacific",
    bedroomCount: 0,
    rentUnfurnishedMin: 30000,
    rentUnfurnishedAvg: 30000,
    rentUnfurnishedMax: 30000,
    rentFurnishedMin: 34000,
    rentFurnishedAvg: 36000,
    rentFurnishedMax: 38000,
    saleAskingLowest: 580000,
    saleAskingAvg: 600000,
    saleAskingHighest: 620000,
    averageSizeSqft: 470,
    averagePricePerSqft: 1080,
    demand: "HIGH",
    confidencePercent: 88,
  }),
  profile({
    communitySlug: "pacific",
    communityName: "Pacific",
    bedroomCount: 1,
    rentUnfurnishedMin: 39000,
    rentUnfurnishedAvg: 42000,
    rentUnfurnishedMax: 45000,
    rentFurnishedMin: 50000,
    rentFurnishedAvg: 52500,
    rentFurnishedMax: 55000,
    saleAskingLowest: 830000,
    saleAskingAvg: 890000,
    saleAskingHighest: 950000,
    averageSizeSqft: 800,
    averagePricePerSqft: 1110,
    demand: "HIGH",
    confidencePercent: 89,
  }),
  profile({
    communitySlug: "pacific",
    communityName: "Pacific",
    bedroomCount: 2,
    rentUnfurnishedMin: 55000,
    rentUnfurnishedAvg: 57500,
    rentUnfurnishedMax: 60000,
    rentFurnishedMin: 60000,
    rentFurnishedAvg: 65000,
    rentFurnishedMax: 70000,
    saleAskingLowest: 1100000,
    saleAskingAvg: 1400000,
    saleAskingHighest: 1700000,
    averageSizeSqft: 1300,
    averagePricePerSqft: 1075,
    demand: "MEDIUM",
    confidencePercent: 87,
  }),
  profile({
    communitySlug: "pacific",
    communityName: "Pacific",
    bedroomCount: 3,
    rentUnfurnishedMin: 75000,
    rentUnfurnishedAvg: 78500,
    rentUnfurnishedMax: 82000,
    rentFurnishedMin: 80000,
    rentFurnishedAvg: 85000,
    rentFurnishedMax: 90000,
    rentFurnishedEstimated: true,
    saleAskingLowest: 1600000,
    saleAskingAvg: 1900000,
    saleAskingHighest: 2200000,
    saleAskingEstimated: true,
    averageSizeSqft: 2350,
    averagePricePerSqft: 1000,
    demand: "MEDIUM",
    confidencePercent: 82,
    notes: "Upper sale range estimated from 1.6M+ benchmark.",
  }),
];

const MINA_AL_ARAB: MarketProfileSeed[] = [
  profile({
    communitySlug: "mina-al-arab-lagoon",
    communityName: "Mina Al Arab Lagoon",
    bedroomCount: 0,
    rentUnfurnishedMin: 24000,
    rentUnfurnishedAvg: 26000,
    rentUnfurnishedMax: 28000,
    rentFurnishedMin: 26000,
    rentFurnishedAvg: 30500,
    rentFurnishedMax: 35000,
    saleAskingLowest: 370000,
    saleAskingAvg: 390000,
    saleAskingHighest: 410000,
    averageSizeSqft: 450,
    averagePricePerSqft: 1050,
    demand: "HIGH",
    confidencePercent: 86,
  }),
  profile({
    communitySlug: "mina-al-arab-lagoon",
    communityName: "Mina Al Arab Lagoon",
    bedroomCount: 1,
    rentUnfurnishedMin: 38000,
    rentUnfurnishedAvg: 42500,
    rentUnfurnishedMax: 47000,
    rentFurnishedMin: 42000,
    rentFurnishedAvg: 47000,
    rentFurnishedMax: 52000,
    rentFurnishedEstimated: true,
    saleAskingLowest: 750000,
    saleAskingAvg: 850000,
    saleAskingHighest: 950000,
    saleAskingEstimated: true,
    averageSizeSqft: 780,
    averagePricePerSqft: 1090,
    demand: "MEDIUM",
    confidencePercent: 80,
    notes: "Upper sale range estimated from 750k+ benchmark.",
  }),
  profile({
    communitySlug: "mina-al-arab-lagoon",
    communityName: "Mina Al Arab Lagoon",
    bedroomCount: 2,
    rentUnfurnishedMin: 65000,
    rentUnfurnishedAvg: 77500,
    rentUnfurnishedMax: 90000,
    rentFurnishedMin: 70000,
    rentFurnishedAvg: 82000,
    rentFurnishedMax: 95000,
    rentFurnishedEstimated: true,
    saleAskingLowest: 1300000,
    saleAskingAvg: 1550000,
    saleAskingHighest: 1800000,
    averageSizeSqft: 1280,
    averagePricePerSqft: 1040,
    demand: "MEDIUM",
    confidencePercent: 84,
  }),
  profile({
    communitySlug: "mina-al-arab-lagoon",
    communityName: "Mina Al Arab Lagoon",
    bedroomCount: 3,
    rentUnfurnishedMin: 90000,
    rentUnfurnishedAvg: 105000,
    rentUnfurnishedMax: 120000,
    rentFurnishedMin: 95000,
    rentFurnishedAvg: 112000,
    rentFurnishedMax: 128000,
    rentUnfurnishedEstimated: true,
    rentFurnishedEstimated: true,
    saleAskingLowest: 1850000,
    saleAskingAvg: 2200000,
    saleAskingHighest: 2550000,
    saleAskingEstimated: true,
    averageSizeSqft: 2300,
    averagePricePerSqft: 980,
    demand: "LOW",
    confidencePercent: 68,
    isEstimated: true,
    notes: "Estimated from Mina Al Arab 2BR and Royal Breeze 3BR benchmarks.",
  }),
];

const ESTIMATED_COMMUNITIES: MarketProfileSeed[] = [
  ...ROYAL_BREEZE.map((row) =>
    scaleProfile(
      row,
      "marina-residences",
      "Marina Residences",
      1.08,
      74,
      "Estimated from Royal Breeze (+8% marina premium)."
    )
  ),
  ...PACIFIC.map((row) =>
    scaleProfile(
      row,
      "golf-apartments",
      "Golf Apartments",
      1.02,
      72,
      "Estimated from Pacific benchmarks."
    )
  ),
  ...ROYAL_BREEZE.map((row) =>
    scaleProfile(
      row,
      "golf-terrace",
      "Golf Terrace",
      1.05,
      71,
      "Estimated between Golf Apartments and Royal Breeze."
    )
  ),
  ...ROYAL_BREEZE.map((row) =>
    scaleProfile(
      row,
      "bayti-homes",
      "Bayti Homes",
      1.12,
      70,
      "Estimated townhouse premium from Royal Breeze."
    )
  ),
  ...ROYAL_BREEZE.map((row) =>
    scaleProfile(
      row,
      "al-hamra-townhouses",
      "Al Hamra Townhouses",
      1.18,
      69,
      "Estimated from Royal Breeze with townhouse premium."
    )
  ),
];

export const MARKET_INTELLIGENCE_SEED: MarketProfileSeed[] = [
  ...ROYAL_BREEZE,
  ...BAB_AL_BAHR,
  ...PACIFIC,
  ...MINA_AL_ARAB,
  ...ESTIMATED_COMMUNITIES,
];

export function toPrismaMarketSeed(
  row: MarketProfileSeed
): Prisma.CommunityMarketIntelligenceCreateInput {
  return {
    communitySlug: row.communitySlug,
    communityName: row.communityName,
    bedroomCount: row.bedroomCount,
    rentFurnishedMin: row.rentFurnishedMin,
    rentFurnishedAvg: row.rentFurnishedAvg,
    rentFurnishedMax: row.rentFurnishedMax,
    rentFurnishedEstimated: row.rentFurnishedEstimated ?? false,
    rentUnfurnishedMin: row.rentUnfurnishedMin,
    rentUnfurnishedAvg: row.rentUnfurnishedAvg,
    rentUnfurnishedMax: row.rentUnfurnishedMax,
    rentUnfurnishedEstimated: row.rentUnfurnishedEstimated ?? false,
    saleAskingLowest: row.saleAskingLowest,
    saleAskingAvg: row.saleAskingAvg,
    saleAskingHighest: row.saleAskingHighest,
    saleAskingEstimated: row.saleAskingEstimated ?? false,
    saleSoldLowest: row.saleSoldLowest,
    saleSoldAvg: row.saleSoldAvg,
    saleSoldHighest: row.saleSoldHighest,
    saleSoldEstimated: row.saleSoldEstimated ?? false,
    averageSizeSqft: row.averageSizeSqft,
    averagePricePerSqft: row.averagePricePerSqft,
    estimatedRoiPercent: row.estimatedRoiPercent,
    demand: row.demand,
    confidencePercent: row.confidencePercent,
    isEstimated: row.isEstimated ?? false,
    notes: row.notes,
  };
}
