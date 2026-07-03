import type { Prisma, PrismaClient } from "@prisma/client";

import type {
  CreatePropertyAggregateInput,
  PropertyAggregate,
  PropertyAggregatePatch,
  PropertyLoadOptions,
  PropertySummary,
} from "@/domain/property";
import type {
  PaginatedResult,
  PropertyFilterParams,
  PropertySearchParams,
} from "@/types";
import type { RepositoryQueryParams } from "@/types/repository";
import type { IPropertyAggregateRepository } from "@/repositories/property/aggregate.repository";

import { buildPropertyInclude } from "../includes/property.include";
import {
  mapPropertyToAggregate,
  mapPropertyToSummary,
  type PropertyWithRelations,
} from "../mappers/property.mapper";
import {
  buildOrderBy,
  toPaginated,
  toSkipTake,
} from "../utils/pagination";

function buildPropertyWhere(
  params: PropertyFilterParams & { query?: string }
): Prisma.PropertyWhereInput {
  return {
    deletedAt: null,
    ...(params.ownerId ? { ownerId: params.ownerId } : {}),
    ...(params.propertyType ? { propertyType: params.propertyType } : {}),
    ...(params.furnishing ? { furnishing: params.furnishing } : {}),
    ...(params.view ? { view: params.view } : {}),
    ...(params.bedrooms !== undefined ? { bedrooms: params.bedrooms } : {}),
    ...(params.minBedrooms !== undefined || params.maxBedrooms !== undefined
      ? {
          bedrooms: {
            ...(params.minBedrooms !== undefined
              ? { gte: params.minBedrooms }
              : {}),
            ...(params.maxBedrooms !== undefined
              ? { lte: params.maxBedrooms }
              : {}),
          },
        }
      : {}),
    ...(params.bathrooms !== undefined ? { bathrooms: params.bathrooms } : {}),
    ...(params.minAreaSqft !== undefined || params.maxAreaSqft !== undefined
      ? {
          areaSqft: {
            ...(params.minAreaSqft !== undefined
              ? { gte: params.minAreaSqft }
              : {}),
            ...(params.maxAreaSqft !== undefined
              ? { lte: params.maxAreaSqft }
              : {}),
          },
        }
      : {}),
    ...(params.communityId ? { communityId: params.communityId } : {}),
    ...(params.buildingId ? { buildingId: params.buildingId } : {}),
    ...(params.query
      ? {
          OR: [
            { propertyCode: { contains: params.query, mode: "insensitive" } },
            { unitNumber: { contains: params.query, mode: "insensitive" } },
            {
              building: {
                name: { contains: params.query, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };
}

const summaryInclude = buildPropertyInclude({ profile: "summary" });

export class PrismaPropertyAggregateRepository
  implements IPropertyAggregateRepository
{
  constructor(private readonly db: PrismaClient) {}

  async create(input: CreatePropertyAggregateInput): Promise<PropertyAggregate> {
    const building = await this.db.building.findUniqueOrThrow({
      where: { id: input.buildingId },
      include: { community: true },
    });

    const record = await this.db.property.create({
      data: {
        propertyCode: input.propertyCode,
        masterCommunityId: building.community.masterCommunityId,
        communityId: building.communityId,
        buildingId: input.buildingId,
        ownerId: input.ownerId ?? null,
        unitNumber: input.unitNumber ?? null,
        floor: input.floor ?? null,
        areaSqft: input.areaSqft ?? null,
        bedrooms: input.bedrooms ?? null,
        bathrooms: input.bathrooms ?? null,
        propertyType: input.propertyType,
        furnishing: input.furnishing ?? null,
        view: input.view ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
      },
      include: buildPropertyInclude({ profile: "detail" }),
    });

    return mapPropertyToAggregate(
      record as unknown as unknown as PropertyWithRelations,
      { profile: "detail" }
    );
  }

  async load(
    propertyId: string,
    options?: PropertyLoadOptions
  ): Promise<PropertyAggregate | null> {
    const record = await this.db.property.findFirst({
      where: { id: propertyId, deletedAt: null },
      include: buildPropertyInclude(options),
    });

    if (!record) return null;
    return mapPropertyToAggregate(record as unknown as PropertyWithRelations, options);
  }

  async loadByCode(
    propertyCode: string,
    options?: PropertyLoadOptions
  ): Promise<PropertyAggregate | null> {
    const record = await this.db.property.findFirst({
      where: { propertyCode, deletedAt: null },
      include: buildPropertyInclude(options),
    });

    if (!record) return null;
    return mapPropertyToAggregate(record as unknown as PropertyWithRelations, options);
  }

  async save(aggregate: PropertyAggregate): Promise<PropertyAggregate> {
    const updated = await this.db.property.update({
      where: { id: aggregate.identity.id, version: aggregate.version },
      data: {
        unitNumber: aggregate.identity.unitNumber,
        floor: aggregate.location.floor,
        areaSqft: aggregate.specification.areaSqft,
        bedrooms: aggregate.specification.bedrooms,
        bathrooms: aggregate.specification.bathrooms,
        propertyType: aggregate.specification.propertyType,
        furnishing: aggregate.specification.furnishing,
        view: aggregate.specification.view,
        version: { increment: 1 },
      },
      include: buildPropertyInclude({
        sections: aggregate.loadedSections,
      }),
    });

    return mapPropertyToAggregate(updated as unknown as PropertyWithRelations, {
      sections: aggregate.loadedSections,
    });
  }

  async patch(
    propertyId: string,
    patch: PropertyAggregatePatch
  ): Promise<PropertyAggregate> {
    if (patch.core) {
      await this.db.property.update({
        where: {
          id: propertyId,
          version: patch.core.version,
        },
        data: {
          unitNumber: patch.core.unitNumber,
          floor: patch.core.floor,
          areaSqft: patch.core.areaSqft,
          bedrooms: patch.core.bedrooms,
          bathrooms: patch.core.bathrooms,
          propertyType: patch.core.propertyType,
          furnishing: patch.core.furnishing,
          view: patch.core.view,
          latitude: patch.core.latitude,
          longitude: patch.core.longitude,
          ownerId: patch.core.ownerId,
          version: { increment: 1 },
        },
      });
    }

    if (patch.append?.length) {
      for (const item of patch.append) {
        if (item.section === "price_history") {
          await this.db.priceHistory.create({
            data: {
              propertyId,
              listingId: item.data.listingId,
              price: item.data.price,
              currency: item.data.currency,
              source: item.data.source,
              recordedAt: item.data.recordedAt,
            },
          });
        }
      }
    }

    const loaded = await this.load(propertyId, {
      profile: "detail",
      sections: patch.sectionsToReload,
    });

    if (!loaded) {
      throw new Error(`Property ${propertyId} not found after patch`);
    }

    return loaded;
  }

  async delete(propertyId: string): Promise<void> {
    await this.db.$transaction([
      this.db.listing.updateMany({
        where: { propertyId, status: { in: ["ACTIVE", "PENDING", "DRAFT"] } },
        data: { status: "WITHDRAWN" },
      }),
      this.db.property.update({
        where: { id: propertyId },
        data: { deletedAt: new Date() },
      }),
    ]);
  }

  async search(
    params: PropertySearchParams,
    query?: RepositoryQueryParams
  ): Promise<PaginatedResult<PropertySummary>> {
    return this.querySummaries({ ...params, query: params.query }, query);
  }

  async filter(
    params: PropertyFilterParams,
    query?: RepositoryQueryParams
  ): Promise<PaginatedResult<PropertySummary>> {
    return this.querySummaries(params, query);
  }

  async findMany(
    query?: RepositoryQueryParams
  ): Promise<PaginatedResult<PropertySummary>> {
    return this.querySummaries({}, query);
  }

  private async querySummaries(
    params: PropertyFilterParams & { query?: string },
    query?: RepositoryQueryParams
  ): Promise<PaginatedResult<PropertySummary>> {
    const where = buildPropertyWhere(params);
    const { page, pageSize, skip, take } = toSkipTake(query);

    const [total, rows] = await this.db.$transaction([
      this.db.property.count({ where }),
      this.db.property.findMany({
        where,
        include: summaryInclude,
        orderBy: buildOrderBy(query, "updatedAt", [
          "updatedAt",
          "createdAt",
          "propertyCode",
          "bedrooms",
        ]),
        skip,
        take,
      }),
    ]);

    return toPaginated(
      rows.map((r) => mapPropertyToSummary(r as unknown as unknown as PropertyWithRelations)),
      total,
      page,
      pageSize
    );
  }

  async findComparables(
    propertyId: string,
    limit = 10
  ): Promise<PropertySummary[]> {
    const comps = await this.db.comparableProperty.findMany({
      where: { subjectPropertyId: propertyId },
      orderBy: { similarityScore: "desc" },
      take: limit,
      include: {
        compProperty: { include: summaryInclude },
      },
    });

    return comps.map((c) =>
      mapPropertyToSummary(c.compProperty as unknown as unknown as PropertyWithRelations)
    );
  }

  async findSimilar(
    propertyId: string,
    limit = 4
  ): Promise<PropertySummary[]> {
    const subject = await this.db.property.findFirst({
      where: { id: propertyId, deletedAt: null },
    });

    if (!subject) return [];

    const tolerance =
      subject.areaSqft !== null
        ? Math.max(Number(subject.areaSqft) * 0.15, 100)
        : undefined;

    const rows = await this.db.property.findMany({
      where: {
        id: { not: propertyId },
        deletedAt: null,
        communityId: subject.communityId,
        ...(subject.bedrooms !== null ? { bedrooms: subject.bedrooms } : {}),
        ...(subject.areaSqft !== null && tolerance
          ? {
              areaSqft: {
                gte: Number(subject.areaSqft) - tolerance,
                lte: Number(subject.areaSqft) + tolerance,
              },
            }
          : {}),
      },
      include: summaryInclude,
      orderBy: { updatedAt: "desc" },
      take: limit,
    });

    return rows.map((r) => mapPropertyToSummary(r as unknown as PropertyWithRelations));
  }

  async getSearchFilterOptions() {
    const [communities, buildings] = await this.db.$transaction([
      this.db.community.findMany({
        select: {
          id: true,
          name: true,
          masterCommunity: { select: { name: true } },
        },
        orderBy: { name: "asc" },
      }),
      this.db.building.findMany({
        select: { id: true, name: true, communityId: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      communities: communities.map((c) => ({
        id: c.id,
        name: c.name,
        masterName: c.masterCommunity.name,
      })),
      buildings,
    };
  }

  async refreshMarketData(propertyId: string): Promise<void> {
    const property = await this.db.property.findFirst({
      where: { id: propertyId, deletedAt: null },
      include: {
        listings: {
          where: { deletedAt: null, status: { in: ["ACTIVE", "PENDING"] } },
        },
      },
    });

    if (!property) return;

    const activeListings = property.listings;
    const prices = activeListings.map((l) => Number(l.askingPrice));
    const avgPrice =
      prices.length > 0
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : null;

    const periodStart = new Date();
    periodStart.setUTCHours(0, 0, 0, 0);

    await this.db.marketStatistics.upsert({
      where: {
        scopeType_scopeId_period_periodStart: {
          scopeType: "PROPERTY",
          scopeId: propertyId,
          period: "DAILY",
          periodStart,
        },
      },
      create: {
        scopeType: "PROPERTY",
        scopeId: propertyId,
        propertyId,
        period: "DAILY",
        periodStart,
        avgAskingPrice: avgPrice,
        activeListingsCount: activeListings.length,
        sampleSize: activeListings.length,
        computedAt: new Date(),
      },
      update: {
        avgAskingPrice: avgPrice,
        activeListingsCount: activeListings.length,
        sampleSize: activeListings.length,
        computedAt: new Date(),
      },
    });
  }

  async refreshComparables(propertyId: string): Promise<void> {
    const similar = await this.findSimilar(propertyId, 10);
    const subject = await this.db.property.findUnique({
      where: { id: propertyId },
      include: {
        listings: {
          where: { status: { in: ["ACTIVE", "PENDING"] } },
          take: 1,
        },
      },
    });

    if (!subject) return;

    const subjectPrice = subject.listings[0]
      ? Number(subject.listings[0].askingPrice)
      : null;

    await this.db.comparableProperty.deleteMany({
      where: { subjectPropertyId: propertyId },
    });

    if (similar.length === 0) return;

    const now = new Date();
    await this.db.comparableProperty.createMany({
      data: similar.map((comp, index) => {
        const compPrice = comp.currentListing?.askingPrice ?? null;
        const diffPct =
          subjectPrice && compPrice
            ? ((compPrice - subjectPrice) / subjectPrice) * 100
            : null;

        return {
          subjectPropertyId: propertyId,
          subjectListingId: subject.listings[0]?.id ?? null,
          compPropertyId: comp.identity.id,
          compListingId: comp.currentListing?.id ?? null,
          similarityScore: Math.max(100 - index * 5, 50),
          priceDifferencePct: diffPct,
          matchedOn: ["community", "bedrooms"],
          computedAt: now,
        };
      }),
    });
  }

  async reindex(_propertyId: string): Promise<void> {
    // property_search_index deferred — aggregate queries used for Sprint 1.
  }
}

export function createPropertyAggregateRepository(
  db: PrismaClient
): IPropertyAggregateRepository {
  return new PrismaPropertyAggregateRepository(db);
}
