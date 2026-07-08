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

const VERIFIED_STATUS_NOTE =
  "Research status: Verified (founder, Sprint 6). Currency: AED.";

const PENDING_STATUS_NOTE =
  "Research status: Pending Research.";

/** Founder-verified profile — no derived sold prices, ROI, or averages. */
export function verifiedProfile(
  input: Omit<
    MarketProfileSeed,
    | "saleSoldLowest"
    | "saleSoldAvg"
    | "saleSoldHighest"
    | "saleSoldEstimated"
    | "estimatedRoiPercent"
    | "isEstimated"
  >
): MarketProfileSeed {
  return {
    ...input,
    rentFurnishedEstimated: false,
    rentUnfurnishedEstimated: false,
    saleAskingEstimated: false,
    saleSoldEstimated: false,
    isEstimated: false,
    confidencePercent: input.confidencePercent ?? 100,
    notes: input.notes
      ? `${input.notes}\n\n${VERIFIED_STATUS_NOTE}`
      : VERIFIED_STATUS_NOTE,
  };
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

const MARINA_RESIDENCES: MarketProfileSeed[] = [
  verifiedProfile({
    communitySlug: "marina-residences",
    communityName: "Marina Residences",
    bedroomCount: 0,
    rentFurnishedMin: 28000,
    rentFurnishedMax: 32000,
    rentUnfurnishedMin: 27000,
    rentUnfurnishedMax: 30000,
    saleAskingLowest: 435000,
    saleAskingHighest: 460000,
    notes: "Studio rent size 505–580 sqft.",
  }),
  verifiedProfile({
    communitySlug: "marina-residences",
    communityName: "Marina Residences",
    bedroomCount: 1,
    rentFurnishedMin: 50000,
    rentFurnishedMax: 57000,
    rentUnfurnishedMin: 38000,
    rentUnfurnishedMax: 45000,
    saleAskingLowest: 720000,
    saleAskingHighest: 800000,
    notes:
      "1BR furnished: 724 sqft AED 50,000–54,000; 1,120 sqft AED 53,000–57,000. Unfurnished: 825 sqft AED 38,000–41,000; 1,360 sqft AED 42,000–45,000. Sale ~771 sqft.",
  }),
  verifiedProfile({
    communitySlug: "marina-residences",
    communityName: "Marina Residences",
    bedroomCount: 2,
    rentFurnishedMin: 58000,
    rentFurnishedMax: 66000,
    rentUnfurnishedMin: 57000,
    rentUnfurnishedMax: 63000,
    saleAskingLowest: 960000,
    saleAskingHighest: 1100000,
  }),
  verifiedProfile({
    communitySlug: "marina-residences",
    communityName: "Marina Residences",
    bedroomCount: 3,
    rentFurnishedMin: 98000,
    rentFurnishedMax: 110000,
    rentUnfurnishedMin: 89000,
    rentUnfurnishedMax: 91000,
    saleAskingLowest: 1680000,
    saleAskingHighest: 1850000,
  }),
];

const BAY_RESIDENCES: MarketProfileSeed[] = [
  verifiedProfile({
    communitySlug: "bay-residences",
    communityName: "Bay Residences",
    bedroomCount: 0,
    rentUnfurnishedMin: 60000,
    rentUnfurnishedMax: 165000,
    saleAskingLowest: 1300000,
    saleAskingHighest: 3300000,
    notes: "Apartments 1–4 bedrooms (community-level verified range).",
  }),
];

const GATEWAY_RESIDENCES: MarketProfileSeed[] = [
  verifiedProfile({
    communitySlug: "gateway-residences",
    communityName: "Gateway Residences",
    bedroomCount: 0,
    rentUnfurnishedMin: 60000,
    rentUnfurnishedMax: 140000,
    saleAskingLowest: 1000000,
    saleAskingHighest: 2200000,
    notes: "Apartments 1–3 bedrooms (community-level verified range).",
  }),
];

const BERMUDA: MarketProfileSeed[] = [
  verifiedProfile({
    communitySlug: "bermuda",
    communityName: "Bermuda",
    bedroomCount: 2,
    saleAskingLowest: 2500000,
    saleAskingHighest: 2500000,
    notes: "Villa 2 Bed / 3 Bath — 2,575 sqft — Sea View — AED 2,500,000. Sale only.",
  }),
  verifiedProfile({
    communitySlug: "bermuda",
    communityName: "Bermuda",
    bedroomCount: 3,
    saleAskingLowest: 3900000,
    saleAskingHighest: 4000000,
    notes:
      "Villa 3 Bed / 4 Bath AED 3,900,000 (3,760 sqft). Villa 3 Bed / 5 Bath AED 4,000,000 (3,750 sqft). Sale only.",
  }),
  verifiedProfile({
    communitySlug: "bermuda",
    communityName: "Bermuda",
    bedroomCount: 4,
    saleAskingLowest: 4500000,
    saleAskingHighest: 5700000,
    notes:
      "Villa 4 Bed / 6 Bath AED 4,500,000–5,700,000 (4,750 sqft). Sale only.",
  }),
  verifiedProfile({
    communitySlug: "bermuda",
    communityName: "Bermuda",
    bedroomCount: 5,
    saleAskingLowest: 6500000,
    saleAskingHighest: 11000000,
    notes:
      "Villa 5 Bed / 6–7 Bath AED 6,500,000–11,000,000 (4,700–6,500 sqft). Sale only.",
  }),
];

const MALIBU: MarketProfileSeed[] = [
  verifiedProfile({
    communitySlug: "malibu",
    communityName: "Malibu",
    bedroomCount: 3,
    saleAskingLowest: 1600000,
    saleAskingHighest: 1800000,
    notes: "3 Bed / 4 Bath — 3,250 sqft — AED 1.60M–1.80M.",
  }),
  verifiedProfile({
    communitySlug: "malibu",
    communityName: "Malibu",
    bedroomCount: 4,
    saleAskingLowest: 1800000,
    saleAskingHighest: 2500000,
    notes:
      "4 Bed / 5 Bath AED 1.80M–2.20M. 4 Bed / 6 Bath AED 2.50M. Large villa tiers: AED 3.0M–3.5M (3,500 sqft, Internal View); AED 5.0M–5.5M (5,500 sqft, Beach Side); AED 7.0M–7.5M (7,500 sqft, Beach View).",
  }),
];

const FLAMINGO: MarketProfileSeed[] = [
  verifiedProfile({
    communitySlug: "flamingo",
    communityName: "Flamingo",
    bedroomCount: 0,
    saleAskingLowest: 1900000,
    saleAskingHighest: 2800000,
    notes:
      "Verified sale prices: AED 1,900,000; AED 2,100,000; AED 2,500,000; AED 2,750,000; AED 2,800,000. Sale only.",
  }),
];

const MARBELLA_PENDING: MarketProfileSeed[] = [
  {
    communitySlug: "marbella",
    communityName: "Marbella",
    bedroomCount: 0,
    isEstimated: true,
    confidencePercent: 0,
    notes:
      "No verified values imported — source material unreadable (Sprint 6).\n\n" +
      PENDING_STATUS_NOTE,
  },
];

const ESTIMATED_COMMUNITIES: MarketProfileSeed[] = [
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
  ...MARINA_RESIDENCES,
  ...BAY_RESIDENCES,
  ...GATEWAY_RESIDENCES,
  ...BERMUDA,
  ...MALIBU,
  ...FLAMINGO,
  ...MARBELLA_PENDING,
  ...ESTIMATED_COMMUNITIES,
];

/** Communities with founder-verified research (Sprint 6). */
export const VERIFIED_COMMUNITY_SLUGS = [
  "marina-residences",
  "bay-residences",
  "gateway-residences",
  "bermuda",
  "malibu",
  "flamingo",
] as const;

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
