import type { IntelligenceUnitCategory } from "@prisma/client";

import { prisma } from "../../src/lib/prisma";

import { upsertCommunityIntelligenceCms } from "../../src/server/market-intelligence/cms/cms.repository";
import type { UpsertCommunityIntelligenceCmsInput } from "../../src/server/market-intelligence/cms/cms.types";

const VERIFIED_BY = {
  email: "founder-import@larssh.local",
  name: "Laith Verified Research (Sprint 6)",
};

export type VerifiedCmsSeed = {
  communityName: string;
  /** Optional DB name override when community.name differs */
  matchName?: string;
  input: UpsertCommunityIntelligenceCmsInput;
};

export const VERIFIED_CMS_SEEDS: VerifiedCmsSeed[] = [
  {
    communityName: "Marina Residences",
    input: {
      communityName: "Marina Residences",
      marketNotes: [
        "Research status: Verified (founder, Sprint 6). Currency: AED.",
        "",
        "RENT — Studio: Furnished AED 28,000–32,000 (505–580 sqft). Unfurnished AED 27,000–30,000.",
        "RENT — 1BR Furnished: 724 sqft AED 50,000–54,000; 1,120 sqft AED 53,000–57,000. Unfurnished: 825 sqft AED 38,000–41,000; 1,360 sqft AED 42,000–45,000.",
        "RENT — 2BR Furnished AED 58,000–66,000. Unfurnished AED 57,000–63,000.",
        "RENT — 3BR Furnished AED 98,000–110,000. Unfurnished AED 89,000–91,000.",
        "",
        "SALE — Studio AED 435,000–460,000.",
        "SALE — 1BR (~771 sqft) AED 720,000–800,000.",
        "SALE — 2BR AED 960,000–1,100,000.",
        "SALE — 3BR AED 1,680,000–1,850,000.",
      ].join("\n"),
    },
  },
  {
    communityName: "Bay Residences",
    input: {
      communityName: "Bay Residences",
      marketNotes: [
        "Research status: Verified (founder, Sprint 6). Currency: AED.",
        "",
        "Apartments (1–4 bedrooms).",
        "Sale: AED 1,300,000 – 3,300,000.",
        "Rental: AED 60,000 – 165,000.",
      ].join("\n"),
    },
  },
  {
    communityName: "Gateway Residences",
    input: {
      communityName: "Gateway Residences",
      marketNotes: [
        "Research status: Verified (founder, Sprint 6). Currency: AED.",
        "",
        "Apartments (1–3 bedrooms).",
        "Sale: AED 1,000,000 – 2,200,000.",
        "Rental: AED 60,000 – 140,000.",
      ].join("\n"),
    },
  },
  {
    communityName: "Bermuda",
    input: {
      communityName: "Bermuda",
      marketNotes: [
        "Research status: Verified (founder, Sprint 6). Currency: AED. Sale only.",
        "",
        "Villa 5 Bed / 7 Bath — AED 11,000,000 — 6,500 sqft — Beach Front.",
        "Villa 5 Bed / 6 Bath — AED 11,000,000 — 5,500 sqft — Beach Front.",
        "Villa 5 Bed / 6 Bath — AED 6,500,000 — 4,700 sqft — Garden View.",
        "Villa 4 Bed / 6 Bath — AED 5,700,000 — 4,750 sqft — Garden View.",
        "Villa 4 Bed / 6 Bath — AED 5,000,000 — 4,750 sqft.",
        "Villa 4 Bed / 6 Bath — AED 4,500,000 — 4,750 sqft.",
        "Villa 3 Bed / 5 Bath — AED 4,000,000 — 3,750 sqft.",
        "Villa 3 Bed / 4 Bath — AED 3,900,000 — 3,760 sqft.",
        "Villa 2 Bed / 3 Bath — AED 2,500,000 — 2,575 sqft — Sea View.",
      ].join("\n"),
      unitTypes: [{ unitType: "VILLA" as IntelligenceUnitCategory }],
    },
  },
  {
    communityName: "Malibu",
    input: {
      communityName: "Malibu",
      marketNotes: [
        "Research status: Verified (founder, Sprint 6). Currency: AED.",
        "",
        "Sale ranges: AED 7.0M–7.5M (7,500 sqft, Beach View).",
        "Sale ranges: AED 5.0M–5.5M (5,500 sqft, Beach Side).",
        "Sale ranges: AED 3.0M–3.5M (3,500 sqft, Internal View).",
        "",
        "3 Bed / 4 Bath — 3,250 sqft — AED 1.60M–1.80M.",
        "4 Bed / 5 Bath — AED 1.80M–2.20M.",
        "4 Bed / 6 Bath — AED 2.50M.",
      ].join("\n"),
      unitTypes: [{ unitType: "VILLA" as IntelligenceUnitCategory }],
    },
  },
  {
    communityName: "Marbella",
    input: {
      communityName: "Marbella",
      marketNotes: [
        "Research status: Pending Research.",
        "",
        "No verified values imported — source material unreadable (Sprint 6).",
      ].join("\n"),
    },
  },
  {
    communityName: "Flamingo",
    input: {
      communityName: "Flamingo",
      marketNotes: [
        "Research status: Verified (founder, Sprint 6). Currency: AED. Sale only.",
        "",
        "Verified sale prices: AED 2,800,000; AED 2,750,000; AED 2,500,000; AED 2,100,000; AED 1,900,000.",
      ].join("\n"),
      unitTypes: [{ unitType: "VILLA" as IntelligenceUnitCategory }],
    },
  },
];

async function findCommunityIdForSeed(seed: VerifiedCmsSeed): Promise<string | null> {
  const name = seed.matchName ?? seed.communityName;

  const byName = await prisma.community.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  if (byName) return byName.id;

  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const bySlug = await prisma.community.findFirst({
    where: { slug: { equals: slug, mode: "insensitive" } },
    select: { id: true },
  });
  return bySlug?.id ?? null;
}

export async function seedVerifiedCmsProfiles(): Promise<{
  upserted: string[];
  skipped: string[];
}> {
  const upserted: string[] = [];
  const skipped: string[] = [];

  for (const seed of VERIFIED_CMS_SEEDS) {
    const communityId = await findCommunityIdForSeed(seed);
    if (!communityId) {
      skipped.push(seed.communityName);
      console.warn(
        `[verified-market-research] CMS skipped (community not in DB): ${seed.communityName}`
      );
      continue;
    }

    await upsertCommunityIntelligenceCms(communityId, seed.input, VERIFIED_BY);
    upserted.push(seed.communityName);
  }

  return { upserted, skipped };
}
