import type {
  CommunityIntelligence,
  MasterCommunity,
  ResidentialProject,
} from "../types";
import { toSlug } from "../lib/slugs";

const GRADIENTS = [
  "from-slate-800 via-slate-700 to-amber-900/50",
  "from-zinc-900 via-slate-800 to-sky-900/40",
  "from-stone-800 via-neutral-800 to-emerald-900/35",
  "from-slate-900 via-indigo-950 to-violet-900/30",
  "from-neutral-900 via-zinc-800 to-rose-900/30",
] as const;

function pickGradient(index: number): string {
  return GRADIENTS[index % GRADIENTS.length];
}

function createIntelligence(
  projectName: string,
  masterName: string,
  seed: number
): CommunityIntelligence {
  const rentBase = 42000 + seed * 3500;
  const saleBase = 1250000 + seed * 185000;
  const sqftBase = 980 + seed * 45;
  const roiBase = 5.2 + seed * 0.35;

  return {
    overview: `${projectName} is a residential project within ${masterName}, positioned for premium waterfront and lifestyle demand in Ras Al Khaimah. This intelligence profile consolidates inventory, pricing benchmarks, and lifestyle context for advisory teams.`,
    buildings: [
      {
        id: `${seed}-b1`,
        title: `${projectName} Tower A`,
        subtitle: "Residential high-rise",
        meta: `${6 + (seed % 4)} floors · ${120 + seed * 8} units`,
      },
      {
        id: `${seed}-b2`,
        title: `${projectName} Tower B`,
        subtitle: "Residential high-rise",
        meta: `${8 + (seed % 3)} floors · ${96 + seed * 6} units`,
      },
      {
        id: `${seed}-b3`,
        title: `${projectName} Podium`,
        subtitle: "Retail & amenities",
        meta: "Ground + 2 levels",
      },
    ],
    unitTypes: [
      { id: `${seed}-u1`, title: "Studio", meta: `${8 + seed}% of inventory` },
      { id: `${seed}-u2`, title: "1 Bedroom", meta: `${22 + seed}% of inventory` },
      { id: `${seed}-u3`, title: "2 Bedroom", meta: `${34 + seed}% of inventory` },
      { id: `${seed}-u4`, title: "3 Bedroom", meta: `${18 + seed}% of inventory` },
      { id: `${seed}-u5`, title: "Penthouse", meta: `${4 + (seed % 3)}% of inventory` },
    ],
    unitSizes: [
      { id: `${seed}-s1`, title: "Studio", meta: "420 – 580 sqft" },
      { id: `${seed}-s2`, title: "1 Bedroom", meta: "780 – 980 sqft" },
      { id: `${seed}-s3`, title: "2 Bedroom", meta: "1,120 – 1,480 sqft" },
      { id: `${seed}-s4`, title: "3 Bedroom", meta: "1,620 – 2,100 sqft" },
      { id: `${seed}-s5`, title: "Penthouse", meta: "2,800 – 4,200 sqft" },
    ],
    activeListings: [
      {
        id: `${seed}-l1`,
        title: "PAC-2401 equivalent",
        subtitle: "2 Bed · Partial sea view",
        meta: "Sale · Active",
      },
      {
        id: `${seed}-l2`,
        title: "RB-1108 equivalent",
        subtitle: "1 Bed · Golf view",
        meta: "Rent · Active",
      },
      {
        id: `${seed}-l3`,
        title: "MR-3302 equivalent",
        subtitle: "3 Bed · Marina front",
        meta: "Sale · Under Offer",
      },
    ],
    averageRent: {
      label: "Average Rent",
      value: `$${rentBase.toLocaleString()}/yr`,
      hint: "Blended annual rent across 1–3 bedroom stock",
    },
    averageSale: {
      label: "Average Sale",
      value: `$${saleBase.toLocaleString()}`,
      hint: "Trailing 90-day average transacted ask",
    },
    roi: {
      label: "ROI",
      value: `${roiBase.toFixed(1)}%`,
      hint: "Estimated gross rental yield",
    },
    pricePerSqft: {
      label: "Price per Sq.ft",
      value: `$${sqftBase.toLocaleString()}`,
      hint: "Sale price normalized per square foot",
    },
    marketTrends: [
      "Absorption improved 8% quarter-over-quarter in this micro-market.",
      "Sea-view premiums holding at 12–18% above internal-facing inventory.",
      "Rent inquiries up with corporate relocation into RAK hospitality corridor.",
      "Secondary sale liquidity strongest in 2-bedroom product segment.",
    ],
    lifestyle: [
      "Resort-style pools and landscaped podiums",
      "Walking distance to dining and marina promenade",
      "Family-oriented community with concierge services",
      "Strong short-stay and long-stay rental demand profile",
    ],
    nearbySchools: [
      { id: `${seed}-sc1`, title: "RAK Academy", meta: "12 min drive" },
      { id: `${seed}-sc2`, title: "GEMS Westminster", meta: "18 min drive" },
      { id: `${seed}-sc3`, title: "Indian High School RAK", meta: "22 min drive" },
    ],
    nearbyHotels: [
      { id: `${seed}-ht1`, title: "Hilton Al Hamra", meta: "5 min drive" },
      { id: `${seed}-ht2`, title: "DoubleTree by Hilton", meta: "8 min drive" },
      { id: `${seed}-ht3`, title: "Mövenpick Resort", meta: "14 min drive" },
    ],
    nearbyRestaurants: [
      { id: `${seed}-rt1`, title: "Marina Walk Dining", meta: "On-site cluster" },
      { id: `${seed}-rt2`, title: "Lexis Rooftop", meta: "7 min drive" },
      { id: `${seed}-rt3`, title: "Beach House Social", meta: "10 min drive" },
    ],
    nearbyBeaches: [
      { id: `${seed}-bc1`, title: "Al Hamra Beach", meta: "Direct access" },
      { id: `${seed}-bc2`, title: "Flamingo Beach", meta: "6 min drive" },
      { id: `${seed}-bc3`, title: "Marjan Public Beach", meta: "11 min drive" },
    ],
    notes:
      "Internal note: prioritize sea-view 2BR inventory for Q3 campaigns. Owner outreach scheduled for premium penthouse stock. Pricing desk review pending for overpriced units above market median.",
  };
}

function createProject(
  name: string,
  masterCommunityId: string,
  masterName: string,
  seed: number
): ResidentialProject {
  return {
    id: toSlug(`${masterCommunityId}-${name}`),
    slug: toSlug(name),
    name,
    masterCommunityId,
    tagline: `Premium residential within ${masterName}`,
    imageGradient: pickGradient(seed),
    intelligence: createIntelligence(name, masterName, seed),
  };
}

function createMaster(
  name: string,
  description: string,
  region: string,
  projectNames: string[],
  gradientIndex: number
): MasterCommunity {
  const id = toSlug(name);

  return {
    id,
    slug: id,
    name,
    description,
    region,
    imageGradient: GRADIENTS[gradientIndex],
    projects: projectNames.map((projectName, index) =>
      createProject(projectName, id, name, gradientIndex * 10 + index + 1)
    ),
  };
}

export const masterCommunities: MasterCommunity[] = [
  createMaster(
    "Al Hamra Village",
    "Flagship master-planned community spanning marina, golf, waterfront, and villa districts across Ras Al Khaimah's premium coastline.",
    "Ras Al Khaimah · West Coast",
    [
      "Royal Breeze Residences",
      "Marina Residences",
      "Golf Apartments",
      "Golf Terrace",
      "Bayti Homes",
      "Al Hamra Townhouses",
      "Falcon Island",
      "Al Hamra Waterfront",
      "Al Hamra Greens",
      "Aila Homes",
    ],
    0
  ),
  createMaster(
    "Al Marjan Island",
    "Iconic man-made island destination with branded residences, hospitality anchors, and high-velocity secondary market activity.",
    "Ras Al Khaimah · Al Marjan Island",
    [
      "Bab Al Bahr",
      "Pacific",
      "Address Residences",
      "Manta Bay",
      "Nikki Beach Residences",
      "JW Marriott Residences",
      "Danah Bay",
    ],
    1
  ),
  createMaster(
    "Mina Al Arab",
    "Emerging coastal master community with phased residential launches and strong government-backed infrastructure investment.",
    "Ras Al Khaimah · Mina Al Arab",
    [],
    2
  ),
  createMaster(
    "Hayat Island",
    "Boutique island community positioned for lifestyle-led waterfront living and long-term capital appreciation.",
    "Ras Al Khaimah · Hayat Island",
    [],
    3
  ),
  createMaster(
    "RAK Central",
    "Urban mixed-use hub connecting commercial, residential, and transit-oriented development in central Ras Al Khaimah.",
    "Ras Al Khaimah · Central District",
    [],
    4
  ),
];

export function getPortfolioStats() {
  const projects = masterCommunities.flatMap((master) => master.projects);

  return {
    masterCount: masterCommunities.length,
    projectCount: projects.length,
    activeListings: projects.reduce(
      (total, project) => total + project.intelligence.activeListings.length,
      0
    ),
  };
}
