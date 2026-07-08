import {
  IntelligenceUnitCategory,
  ListingStatus,
  ListingType,
  PropertyType,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type { CommunityIntelligenceUnitBenchmarkRecord } from "./cms.types";

type ListingAggregateRow = {
  listing_type: ListingType;
  avg_price: number | null;
  avg_psf: number | null;
};

type UnitAggregateRow = {
  unit_type: IntelligenceUnitCategory;
  avg_sale: number | null;
  avg_rent: number | null;
  avg_psf: number | null;
};

export type CalculatedCommunityMetrics = {
  averageSalePriceAed: number | null;
  averageRentAedYear: number | null;
  averagePricePerSqftAed: number | null;
  averageRoiPercent: number | null;
  unitTypes: CommunityIntelligenceUnitBenchmarkRecord[];
};

function bedroomToUnitCategory(
  bedrooms: number | null,
  propertyType: PropertyType
): IntelligenceUnitCategory | null {
  if (propertyType === PropertyType.TOWNHOUSE) return "TOWNHOUSE";
  if (propertyType === PropertyType.VILLA) return "VILLA";

  if (bedrooms === null || bedrooms === undefined) return null;
  if (bedrooms <= 0) return "STUDIO";
  if (bedrooms === 1) return "ONE_BEDROOM";
  if (bedrooms === 2) return "TWO_BEDROOM";
  if (bedrooms === 3) return "THREE_BEDROOM";
  if (bedrooms >= 4) return "FOUR_BEDROOM";
  return null;
}

export async function calculateCommunityMetricsFromListings(
  communityId: string
): Promise<CalculatedCommunityMetrics> {
  const listingRows = await prisma.$queryRaw<ListingAggregateRow[]>(Prisma.sql`
    SELECT
      l.listing_type,
      AVG(l.asking_price)::float AS avg_price,
      AVG(l.price_per_sqft)::float AS avg_psf
    FROM listings l
    INNER JOIN properties p ON p.id = l.property_id
    WHERE p.community_id = ${communityId}::uuid
      AND p.deleted_at IS NULL
      AND l.deleted_at IS NULL
      AND l.status = ${ListingStatus.ACTIVE}::"ListingStatus"
      AND l.asking_price IS NOT NULL
    GROUP BY l.listing_type
  `);

  const saleRow = listingRows.find((row) => row.listing_type === ListingType.SALE);
  const rentRow = listingRows.find((row) => row.listing_type === ListingType.RENT);

  const averageSalePriceAed = saleRow?.avg_price ?? null;
  const averageRentAedYear = rentRow?.avg_price ?? null;
  const averagePricePerSqftAed = saleRow?.avg_psf ?? rentRow?.avg_psf ?? null;
  const averageRoiPercent =
    averageRentAedYear !== null &&
    averageSalePriceAed !== null &&
    averageSalePriceAed > 0
      ? Math.round((averageRentAedYear / averageSalePriceAed) * 10000) / 100
      : null;

  const unitRows = await prisma.$queryRaw<
    Array<{
      bedrooms: number | null;
      property_type: PropertyType;
      listing_type: ListingType;
      avg_price: number | null;
      avg_psf: number | null;
    }>
  >(Prisma.sql`
    SELECT
      p.bedrooms,
      p.property_type,
      l.listing_type,
      AVG(l.asking_price)::float AS avg_price,
      AVG(l.price_per_sqft)::float AS avg_psf
    FROM listings l
    INNER JOIN properties p ON p.id = l.property_id
    WHERE p.community_id = ${communityId}::uuid
      AND p.deleted_at IS NULL
      AND l.deleted_at IS NULL
      AND l.status = ${ListingStatus.ACTIVE}::"ListingStatus"
      AND l.asking_price IS NOT NULL
    GROUP BY p.bedrooms, p.property_type, l.listing_type
  `);

  const unitMap = new Map<
    IntelligenceUnitCategory,
    { sale: number[]; rent: number[]; psf: number[] }
  >();

  for (const row of unitRows) {
    const category = bedroomToUnitCategory(row.bedrooms, row.property_type);
    if (!category) continue;

    const bucket = unitMap.get(category) ?? { sale: [], rent: [], psf: [] };
    if (row.listing_type === ListingType.SALE && row.avg_price !== null) {
      bucket.sale.push(row.avg_price);
    }
    if (row.listing_type === ListingType.RENT && row.avg_price !== null) {
      bucket.rent.push(row.avg_price);
    }
    if (row.avg_psf !== null) {
      bucket.psf.push(row.avg_psf);
    }
    unitMap.set(category, bucket);
  }

  const average = (values: number[]) =>
    values.length
      ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) /
        100
      : null;

  const unitTypes: CommunityIntelligenceUnitBenchmarkRecord[] = Array.from(
    unitMap.entries()
  ).map(([unitType, bucket]) => ({
    unitType,
    averageSalePriceAed: average(bucket.sale),
    averageRentAedYear: average(bucket.rent),
    averagePricePerSqftAed: average(bucket.psf),
    isCalculated: true,
  }));

  return {
    averageSalePriceAed,
    averageRentAedYear,
    averagePricePerSqftAed,
    averageRoiPercent,
    unitTypes,
  };
}
