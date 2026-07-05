import type { ListingType, Prisma, PropertyType } from "@prisma/client";
import { ListingStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type { SearchFiltersInput } from "@/features/search/schemas/search-filters.schema";
import { rscTry } from "@/lib/rsc-debug";

const listingAgentInclude = {
  agent: { include: { user: true } },
} satisfies Prisma.ListingInclude;

export const propertySearchInclude = {
  community: true,
  building: { include: { community: true } },
  listings: {
    include: listingAgentInclude,
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" as const },
  },
} satisfies Prisma.PropertyInclude;

export const propertyDetailsInclude = {
  masterCommunity: true,
  community: true,
  building: { include: { community: true } },
  listings: {
    include: listingAgentInclude,
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" as const },
  },
  photos: {
    orderBy: { sortOrder: "asc" as const },
  },
  propertyImages: {
    orderBy: { displayOrder: "asc" as const },
  },
  floorPlans: {
    orderBy: { sortOrder: "asc" as const },
  },
  notes: {
    orderBy: { createdAt: "desc" as const },
    include: {
      author: { select: { fullName: true } },
    },
  },
  owner: true,
} satisfies Prisma.PropertyInclude;

export const similarPropertyInclude = {
  community: true,
  building: { include: { community: true } },
  listings: {
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" as const },
    take: 2,
  },
} satisfies Prisma.PropertyInclude;

export type PropertySearchRecord = Prisma.PropertyGetPayload<{
  include: typeof propertySearchInclude;
}>;

export type PropertyDetailsRecord = Prisma.PropertyGetPayload<{
  include: typeof propertyDetailsInclude;
}>;

export type SimilarPropertyRecord = Prisma.PropertyGetPayload<{
  include: typeof similarPropertyInclude;
}>;

function buildSearchWhere(filters: SearchFiltersInput): Prisma.PropertyWhereInput {
  const listingConditions: Prisma.ListingWhereInput[] = [];

  if (filters.status) {
    listingConditions.push({ status: filters.status });
  }

  if (filters.listingType) {
    listingConditions.push({ listingType: filters.listingType });
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    listingConditions.push({
      askingPrice: {
        ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
      },
    });
  }

  if (
    filters.minPricePerSqft !== undefined ||
    filters.maxPricePerSqft !== undefined
  ) {
    listingConditions.push({
      pricePerSqft: {
        ...(filters.minPricePerSqft !== undefined
          ? { gte: filters.minPricePerSqft }
          : {}),
        ...(filters.maxPricePerSqft !== undefined
          ? { lte: filters.maxPricePerSqft }
          : {}),
      },
    });
  }

  return {
    deletedAt: null,
    ...(filters.communityId ? { communityId: filters.communityId } : {}),
    ...(filters.buildingId ? { buildingId: filters.buildingId } : {}),
    ...(filters.propertyType ? { propertyType: filters.propertyType } : {}),
    ...(filters.bedrooms !== undefined ? { bedrooms: filters.bedrooms } : {}),
    ...(filters.bathrooms !== undefined
      ? { bathrooms: filters.bathrooms }
      : {}),
    ...(filters.furnishing ? { furnishing: filters.furnishing } : {}),
    ...(filters.view ? { view: filters.view } : {}),
    ...(filters.minSize !== undefined || filters.maxSize !== undefined
      ? {
          areaSqft: {
            ...(filters.minSize !== undefined ? { gte: filters.minSize } : {}),
            ...(filters.maxSize !== undefined ? { lte: filters.maxSize } : {}),
          },
        }
      : {}),
    ...(listingConditions.length > 0
      ? { listings: { some: { AND: listingConditions, deletedAt: null } } }
      : {}),
  };
}

export async function getAllProperties(): Promise<PropertySearchRecord[]> {
  return prisma.property.findMany({
    where: { deletedAt: null },
    include: propertySearchInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function searchProperties(
  filters: SearchFiltersInput = {}
): Promise<PropertySearchRecord[]> {
  return prisma.property.findMany({
    where: buildSearchWhere(filters),
    include: propertySearchInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPropertyById(
  id: string
): Promise<PropertyDetailsRecord | null> {
  return prisma.property.findFirst({
    where: { id, deletedAt: null },
    include: propertyDetailsInclude,
  });
}

export type SimilarPropertiesInput = {
  propertyId: string;
  communityId: string;
  propertyType: PropertyType;
  bedrooms: number | null;
  areaSqft: number | null;
  askingPrice: number | null;
  listingType: ListingType | null;
  limit?: number;
};

export async function getSimilarProperties({
  propertyId,
  communityId,
  propertyType,
  bedrooms,
  areaSqft: _areaSqft,
  askingPrice,
  listingType,
  limit = 4,
}: SimilarPropertiesInput): Promise<SimilarPropertyRecord[]> {
  const priceTolerance =
    askingPrice !== null && askingPrice > 0 ? askingPrice * 0.2 : undefined;

  return prisma.property.findMany({
    where: {
      id: { not: propertyId },
      deletedAt: null,
      communityId,
      propertyType,
      ...(bedrooms !== null ? { bedrooms } : {}),
      ...(askingPrice !== null &&
      priceTolerance !== undefined &&
      listingType
        ? {
            listings: {
              some: {
                deletedAt: null,
                listingType,
                status: {
                  in: [ListingStatus.ACTIVE, ListingStatus.PENDING],
                },
                askingPrice: {
                  gte: askingPrice - priceTolerance,
                  lte: askingPrice + priceTolerance,
                },
              },
            },
          }
        : {}),
    },
    include: similarPropertyInclude,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function getCommunityOptions() {
  return prisma.community.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getBuildingOptions(communityId?: string) {
  return prisma.building.findMany({
    where: communityId ? { communityId } : undefined,
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function fetchSearchPageData(filters: SearchFiltersInput = {}) {
  return rscTry("property.repository:fetchSearchPageData", async () => {
  const where = buildSearchWhere(filters);

  const [properties, communities, buildings] = await prisma.$transaction([
    prisma.property.findMany({
      where,
      include: propertySearchInclude,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.community.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.building.findMany({
      where: filters.communityId ? { communityId: filters.communityId } : undefined,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { properties, communities, buildings };
  });
}

export function getAgentDisplayName(
  agent: PropertySearchRecord["listings"][number]["agent"] | null | undefined
): string | null {
  return agent?.user?.fullName ?? null;
}
