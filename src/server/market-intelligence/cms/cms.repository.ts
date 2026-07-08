import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type {
  CommunityIntelligenceCmsCalculatedSnapshot,
  CommunityIntelligenceCmsManualSnapshot,
  CommunityIntelligenceCmsRecord,
  CommunityListItem,
  NearbyPlace,
  UpsertCommunityIntelligenceCmsInput,
} from "./cms.types";
import { INTELLIGENCE_UNIT_CATEGORIES } from "./cms.types";
import {
  calculateCommunityMetricsFromListings,
  type CalculatedCommunityMetrics,
} from "./cms.calculated";

function decimalToNumber(value: Prisma.Decimal | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function parseNearbyPlaces(value: unknown): NearbyPlace[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return { title: item };
      if (
        item &&
        typeof item === "object" &&
        "title" in item &&
        typeof (item as NearbyPlace).title === "string"
      ) {
        return {
          title: (item as NearbyPlace).title,
          meta:
            typeof (item as NearbyPlace).meta === "string"
              ? (item as NearbyPlace).meta
              : undefined,
        };
      }
      return null;
    })
    .filter((item): item is NearbyPlace => item !== null);
}

function pickManual<T>(manual: T | null | undefined, calculated: T | null): {
  value: T | null;
  source: "manual" | "calculated" | null;
} {
  if (manual !== null && manual !== undefined) {
    return { value: manual, source: "manual" };
  }
  if (calculated !== null && calculated !== undefined) {
    return { value: calculated, source: "calculated" };
  }
  return { value: null, source: null };
}

const EMPTY_CALCULATED: CalculatedCommunityMetrics = {
  averageSalePriceAed: null,
  averageRentAedYear: null,
  averagePricePerSqftAed: null,
  averageRoiPercent: null,
  unitTypes: [],
};

async function loadCalculatedMetricsSafe(
  communityId: string
): Promise<CalculatedCommunityMetrics> {
  try {
    return await calculateCommunityMetricsFromListings(communityId);
  } catch (error) {
    console.error(
      "[market-intelligence-cms] calculateCommunityMetricsFromListings:",
      error
    );
    return EMPTY_CALCULATED;
  }
}

function buildManualSnapshot(
  cms: Awaited<ReturnType<typeof loadManualCmsRecord>>
): CommunityIntelligenceCmsManualSnapshot {
  const manualUnitMap = new Map(
    (cms?.unitTypes ?? []).map((row) => [row.unitType, row])
  );

  return {
    averageSalePriceAed: decimalToNumber(cms?.averageSalePriceAed),
    averageRentAedYear: decimalToNumber(cms?.averageRentAedYear),
    averagePricePerSqftAed: decimalToNumber(cms?.averagePricePerSqftAed),
    averageRoiPercent: decimalToNumber(cms?.averageRoiPercent),
    unitTypes: INTELLIGENCE_UNIT_CATEGORIES.map((unitType) => {
      const row = manualUnitMap.get(unitType);
      return {
        unitType,
        averageSalePriceAed: decimalToNumber(row?.averageSalePriceAed),
        averageRentAedYear: decimalToNumber(row?.averageRentAedYear),
        averagePricePerSqftAed: decimalToNumber(row?.averagePricePerSqftAed),
      };
    }).filter(
      (row) =>
        row.averageSalePriceAed !== null ||
        row.averageRentAedYear !== null ||
        row.averagePricePerSqftAed !== null
    ),
  };
}

function buildCalculatedSnapshot(
  calculated: CalculatedCommunityMetrics
): CommunityIntelligenceCmsCalculatedSnapshot {
  const calculatedUnitMap = new Map(
    calculated.unitTypes.map((row) => [row.unitType, row])
  );

  return {
    averageSalePriceAed: calculated.averageSalePriceAed,
    averageRentAedYear: calculated.averageRentAedYear,
    averagePricePerSqftAed: calculated.averagePricePerSqftAed,
    averageRoiPercent: calculated.averageRoiPercent,
    unitTypes: INTELLIGENCE_UNIT_CATEGORIES.map((unitType) => {
      const row = calculatedUnitMap.get(unitType);
      return {
        unitType,
        averageSalePriceAed: row?.averageSalePriceAed ?? null,
        averageRentAedYear: row?.averageRentAedYear ?? null,
        averagePricePerSqftAed: row?.averagePricePerSqftAed ?? null,
      };
    }).filter(
      (row) =>
        row.averageSalePriceAed !== null ||
        row.averageRentAedYear !== null ||
        row.averagePricePerSqftAed !== null
    ),
  };
}

async function loadManualCmsRecord(communityId: string) {
  try {
    return await prisma.communityIntelligenceCms.findUnique({
      where: { communityId },
      include: { unitTypes: true },
    });
  } catch (error) {
    console.error("[market-intelligence-cms] loadManualCmsRecord:", error);
    return null;
  }
}

export async function communityExists(communityId: string): Promise<boolean> {
  try {
    const row = await prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true },
    });
    return Boolean(row);
  } catch {
    return false;
  }
}

export async function listCommunitiesForCms(): Promise<CommunityListItem[]> {
  try {
    const rows = await prisma.community.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        masterCommunity: { select: { name: true } },
        intelligenceCms: { select: { updatedAt: true } },
      },
      orderBy: [{ masterCommunity: { name: "asc" } }, { name: "asc" }],
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      masterCommunityName: row.masterCommunity.name,
      hasCmsProfile: Boolean(row.intelligenceCms),
      updatedAt: row.intelligenceCms?.updatedAt.toISOString() ?? null,
    }));
  } catch (error) {
    console.error("[market-intelligence-cms] listCommunitiesForCms:", error);
    return [];
  }
}

export async function getCommunityIntelligenceCmsByCommunityId(
  communityId: string
): Promise<CommunityIntelligenceCmsRecord | null> {
  let community: {
    id: string;
    name: string;
    masterCommunity: { name: string };
  } | null = null;

  try {
    community = await prisma.community.findUnique({
      where: { id: communityId },
      select: {
        id: true,
        name: true,
        masterCommunity: { select: { name: true } },
      },
    });
  } catch (error) {
    console.error("[market-intelligence-cms] community lookup:", error);
    return null;
  }

  if (!community) return null;

  const [cms, calculated] = await Promise.all([
    loadManualCmsRecord(communityId),
    loadCalculatedMetricsSafe(communityId),
  ]);

  const manual = buildManualSnapshot(cms);
  const calculatedSnapshot = buildCalculatedSnapshot(calculated);

  const sale = pickManual(
    manual.averageSalePriceAed,
    calculatedSnapshot.averageSalePriceAed
  );
  const rent = pickManual(
    manual.averageRentAedYear,
    calculatedSnapshot.averageRentAedYear
  );
  const psf = pickManual(
    manual.averagePricePerSqftAed,
    calculatedSnapshot.averagePricePerSqftAed
  );
  const roi = pickManual(
    manual.averageRoiPercent,
    calculatedSnapshot.averageRoiPercent
  );

  const manualUnitMap = new Map(
    manual.unitTypes.map((row) => [row.unitType, row])
  );
  const calculatedUnitMap = new Map(
    calculatedSnapshot.unitTypes.map((row) => [row.unitType, row])
  );

  const unitTypes = INTELLIGENCE_UNIT_CATEGORIES.map((unitType) => {
    const manualRow = manualUnitMap.get(unitType);
    const calcRow = calculatedUnitMap.get(unitType);
    const salePrice = pickManual(
      manualRow?.averageSalePriceAed ?? null,
      calcRow?.averageSalePriceAed ?? null
    );
    const rentYear = pickManual(
      manualRow?.averageRentAedYear ?? null,
      calcRow?.averageRentAedYear ?? null
    );
    const pricePsf = pickManual(
      manualRow?.averagePricePerSqftAed ?? null,
      calcRow?.averagePricePerSqftAed ?? null
    );

    return {
      unitType,
      averageSalePriceAed: salePrice.value,
      averageRentAedYear: rentYear.value,
      averagePricePerSqftAed: pricePsf.value,
      isCalculated:
        !manualRow &&
        Boolean(calcRow) &&
        salePrice.source !== "manual" &&
        rentYear.source !== "manual" &&
        pricePsf.source !== "manual",
    };
  });

  return {
    id: cms?.id ?? community.id,
    communityId: community.id,
    communityName: cms?.communityName ?? community.name,
    masterCommunityName: community.masterCommunity.name,
    overview: cms?.overview ?? null,
    investmentSummary: cms?.investmentSummary ?? null,
    bestFor: cms?.bestFor ?? null,
    pros: parseStringArray(cms?.pros),
    cons: parseStringArray(cms?.cons),
    marketNotes: cms?.marketNotes ?? null,
    averageSalePriceAed: sale.value,
    averageRentAedYear: rent.value,
    averagePricePerSqftAed: psf.value,
    averageRoiPercent: roi.value,
    capitalAppreciationPercent: decimalToNumber(cms?.capitalAppreciationPercent),
    rentalDemand: cms?.rentalDemand ?? null,
    occupancyRatePercent: decimalToNumber(cms?.occupancyRatePercent),
    luxuryScore: cms?.luxuryScore ?? null,
    familyScore: cms?.familyScore ?? null,
    investmentScore: cms?.investmentScore ?? null,
    lifestyleScore: cms?.lifestyleScore ?? null,
    walkability: cms?.walkability ?? null,
    beachAccess: cms?.beachAccess ?? null,
    shortTermRentalScore: cms?.shortTermRentalScore ?? null,
    longTermRentalScore: cms?.longTermRentalScore ?? null,
    nearbySchools: parseNearbyPlaces(cms?.nearbySchools),
    nearbyHospitals: parseNearbyPlaces(cms?.nearbyHospitals),
    nearbyRestaurants: parseNearbyPlaces(cms?.nearbyRestaurants),
    nearbySupermarkets: parseNearbyPlaces(cms?.nearbySupermarkets),
    nearbyHotels: parseNearbyPlaces(cms?.nearbyHotels),
    nearbyShopping: parseNearbyPlaces(cms?.nearbyShopping),
    hiddenMarketInsights: cms?.hiddenMarketInsights ?? null,
    futureDevelopments: cms?.futureDevelopments ?? null,
    thingsBuyersShouldKnow: cms?.thingsBuyersShouldKnow ?? null,
    thingsInvestorsShouldKnow: cms?.thingsInvestorsShouldKnow ?? null,
    updatedByEmail: cms?.updatedByEmail ?? null,
    updatedByName: cms?.updatedByName ?? null,
    updatedAt: cms?.updatedAt.toISOString() ?? new Date(0).toISOString(),
    unitTypes,
    sources: {
      averageSalePriceAed: sale.source,
      averageRentAedYear: rent.source,
      averagePricePerSqftAed: psf.source,
      averageRoiPercent: roi.source,
    },
    manual,
    calculated: calculatedSnapshot,
    hasManualProfile: Boolean(cms),
  };
}

export async function upsertCommunityIntelligenceCms(
  communityId: string,
  input: UpsertCommunityIntelligenceCmsInput,
  updatedBy: { email: string; name: string }
): Promise<CommunityIntelligenceCmsRecord> {
  const unitTypes = input.unitTypes ?? [];

  await prisma.$transaction(async (tx) => {
    const cms = await tx.communityIntelligenceCms.upsert({
      where: { communityId },
      create: {
        communityId,
        communityName: input.communityName,
        overview: input.overview ?? null,
        investmentSummary: input.investmentSummary ?? null,
        bestFor: input.bestFor ?? null,
        pros: input.pros ?? [],
        cons: input.cons ?? [],
        marketNotes: input.marketNotes ?? null,
        averageSalePriceAed: input.averageSalePriceAed ?? null,
        averageRentAedYear: input.averageRentAedYear ?? null,
        averagePricePerSqftAed: input.averagePricePerSqftAed ?? null,
        averageRoiPercent: input.averageRoiPercent ?? null,
        capitalAppreciationPercent: input.capitalAppreciationPercent ?? null,
        rentalDemand: input.rentalDemand ?? null,
        occupancyRatePercent: input.occupancyRatePercent ?? null,
        luxuryScore: input.luxuryScore ?? null,
        familyScore: input.familyScore ?? null,
        investmentScore: input.investmentScore ?? null,
        lifestyleScore: input.lifestyleScore ?? null,
        walkability: input.walkability ?? null,
        beachAccess: input.beachAccess ?? null,
        shortTermRentalScore: input.shortTermRentalScore ?? null,
        longTermRentalScore: input.longTermRentalScore ?? null,
        nearbySchools: input.nearbySchools ?? [],
        nearbyHospitals: input.nearbyHospitals ?? [],
        nearbyRestaurants: input.nearbyRestaurants ?? [],
        nearbySupermarkets: input.nearbySupermarkets ?? [],
        nearbyHotels: input.nearbyHotels ?? [],
        nearbyShopping: input.nearbyShopping ?? [],
        hiddenMarketInsights: input.hiddenMarketInsights ?? null,
        futureDevelopments: input.futureDevelopments ?? null,
        thingsBuyersShouldKnow: input.thingsBuyersShouldKnow ?? null,
        thingsInvestorsShouldKnow: input.thingsInvestorsShouldKnow ?? null,
        updatedByEmail: updatedBy.email,
        updatedByName: updatedBy.name,
      },
      update: {
        communityName: input.communityName,
        overview: input.overview ?? null,
        investmentSummary: input.investmentSummary ?? null,
        bestFor: input.bestFor ?? null,
        pros: input.pros ?? [],
        cons: input.cons ?? [],
        marketNotes: input.marketNotes ?? null,
        averageSalePriceAed: input.averageSalePriceAed ?? null,
        averageRentAedYear: input.averageRentAedYear ?? null,
        averagePricePerSqftAed: input.averagePricePerSqftAed ?? null,
        averageRoiPercent: input.averageRoiPercent ?? null,
        capitalAppreciationPercent: input.capitalAppreciationPercent ?? null,
        rentalDemand: input.rentalDemand ?? null,
        occupancyRatePercent: input.occupancyRatePercent ?? null,
        luxuryScore: input.luxuryScore ?? null,
        familyScore: input.familyScore ?? null,
        investmentScore: input.investmentScore ?? null,
        lifestyleScore: input.lifestyleScore ?? null,
        walkability: input.walkability ?? null,
        beachAccess: input.beachAccess ?? null,
        shortTermRentalScore: input.shortTermRentalScore ?? null,
        longTermRentalScore: input.longTermRentalScore ?? null,
        nearbySchools: input.nearbySchools ?? [],
        nearbyHospitals: input.nearbyHospitals ?? [],
        nearbyRestaurants: input.nearbyRestaurants ?? [],
        nearbySupermarkets: input.nearbySupermarkets ?? [],
        nearbyHotels: input.nearbyHotels ?? [],
        nearbyShopping: input.nearbyShopping ?? [],
        hiddenMarketInsights: input.hiddenMarketInsights ?? null,
        futureDevelopments: input.futureDevelopments ?? null,
        thingsBuyersShouldKnow: input.thingsBuyersShouldKnow ?? null,
        thingsInvestorsShouldKnow: input.thingsInvestorsShouldKnow ?? null,
        updatedByEmail: updatedBy.email,
        updatedByName: updatedBy.name,
      },
    });

    for (const unit of unitTypes) {
      await tx.communityIntelligenceUnitBenchmark.upsert({
        where: {
          cmsId_unitType: {
            cmsId: cms.id,
            unitType: unit.unitType,
          },
        },
        create: {
          cmsId: cms.id,
          unitType: unit.unitType,
          averageSalePriceAed: unit.averageSalePriceAed ?? null,
          averageRentAedYear: unit.averageRentAedYear ?? null,
          averagePricePerSqftAed: unit.averagePricePerSqftAed ?? null,
        },
        update: {
          averageSalePriceAed: unit.averageSalePriceAed ?? null,
          averageRentAedYear: unit.averageRentAedYear ?? null,
          averagePricePerSqftAed: unit.averagePricePerSqftAed ?? null,
        },
      });
    }
  });

  const record = await getCommunityIntelligenceCmsByCommunityId(communityId);
  if (!record) {
    throw new Error("Failed to load saved community intelligence profile");
  }
  return record;
}

export async function deleteCommunityIntelligenceCms(communityId: string): Promise<void> {
  try {
    await prisma.communityIntelligenceCms.deleteMany({
      where: { communityId },
    });
  } catch (error) {
    console.error("[market-intelligence-cms] deleteCommunityIntelligenceCms:", error);
    throw error;
  }
}

export async function findCommunityIdByName(
  communityName: string
): Promise<string | null> {
  try {
    const byName = await prisma.community.findFirst({
      where: { name: { equals: communityName, mode: "insensitive" } },
      select: { id: true },
    });
    if (byName) return byName.id;

    const slug = communityName.trim().toLowerCase().replace(/\s+/g, "-");
    const bySlug = await prisma.community.findFirst({
      where: { slug: { equals: slug, mode: "insensitive" } },
      select: { id: true },
    });
    return bySlug?.id ?? null;
  } catch (error) {
    console.error("[market-intelligence-cms] findCommunityIdByName:", error);
    return null;
  }
}
