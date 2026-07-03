import type { PrismaClient } from "@prisma/client";

import type {
  CreateDealInput,
  UpdateDealInput,
} from "@/types/inputs";
import type { DealFilterParams } from "@/types/filters";
import type { PaginatedResult } from "@/types";
import type { RepositoryQueryParams } from "@/types/repository";
import type { Deal } from "@/types";

import { toPaginated, toSkipTake, buildOrderBy } from "../utils/pagination";
import { toDealDto, type DealDto } from "@/lib/dto/entity.dto";

export class PrismaDealRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(input: CreateDealInput): Promise<DealDto> {
    const listing = await this.db.listing.findUniqueOrThrow({
      where: { id: input.listingId },
      select: { propertyId: true },
    });

    const deal = await this.db.deal.create({
      data: {
        propertyId: listing.propertyId,
        listingId: input.listingId,
        buyerId: input.buyerId,
        agentId: input.agentId,
        status: input.status,
        offerPrice: input.offerPrice,
        agreedPrice: input.agreedPrice,
        currency: input.currency,
        openedAt: input.openedAt ? new Date(input.openedAt) : undefined,
      },
    });
    return toDealDto(deal);
  }

  async findById(id: string): Promise<DealDto | null> {
    const deal = await this.db.deal.findUnique({ where: { id } });
    return deal ? toDealDto(deal) : null;
  }

  async findByProperty(
    propertyId: string,
    query?: RepositoryQueryParams
  ): Promise<PaginatedResult<DealDto>> {
    const { page, pageSize, skip, take } = toSkipTake(query);
    const where = { propertyId };
    const [total, rows] = await this.db.$transaction([
      this.db.deal.count({ where }),
      this.db.deal.findMany({
        where,
        orderBy: buildOrderBy(query, "openedAt", [
          "openedAt",
          "createdAt",
          "updatedAt",
          "status",
          "offerPrice",
        ]),
        skip,
        take,
      }),
    ]);
    return toPaginated(rows.map(toDealDto), total, page, pageSize);
  }

  async update(id: string, input: UpdateDealInput): Promise<DealDto> {
    const deal = await this.db.deal.update({
      where: { id },
      data: {
        status: input.status,
        offerPrice: input.offerPrice,
        agreedPrice: input.agreedPrice,
        closedAt: input.closedAt ? new Date(input.closedAt) : undefined,
      },
    });
    return toDealDto(deal);
  }
}

export class PrismaTaskRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(input: {
    propertyId?: string | null;
    title: string;
    description?: string | null;
    assigneeUserId?: string | null;
    assigneeAgentId?: string | null;
    relatedEntityType?: string | null;
    relatedEntityId?: string | null;
    dueAt?: Date | null;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    status?: "PENDING" | "COMPLETED" | "CANCELLED";
  }) {
    return this.db.task.create({ data: input });
  }

  async findByProperty(propertyId: string) {
    return this.db.task.findMany({
      where: { propertyId },
      orderBy: { dueAt: "asc" },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.db.task.update({ where: { id }, data: data as never });
  }
}

export class PrismaPriceHistoryRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(propertyId: string, input: {
    listingId?: string | null;
    price: number;
    currency?: string;
    source?: string;
    recordedAt: Date;
  }) {
    const row = await this.db.priceHistory.create({
      data: { propertyId, ...input },
    });
    return row;
  }

  async findByProperty(propertyId: string, limit = 100) {
    return this.db.priceHistory.findMany({
      where: { propertyId },
      orderBy: { recordedAt: "desc" },
      take: limit,
    });
  }
}

export class PrismaMarketStatisticsRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByProperty(propertyId: string) {
    return this.db.marketStatistics.findMany({
      where: { propertyId },
      orderBy: { periodStart: "desc" },
      take: 12,
    });
  }
}

export class PrismaComparablePropertyRepository {
  constructor(private readonly db: PrismaClient) {}

  async findBySubjectProperty(subjectPropertyId: string, limit = 20) {
    return this.db.comparableProperty.findMany({
      where: { subjectPropertyId },
      orderBy: { similarityScore: "desc" },
      take: limit,
    });
  }
}

export function createEntityRepositories(db: PrismaClient) {
  return {
    deals: new PrismaDealRepository(db),
    tasks: new PrismaTaskRepository(db),
    priceHistory: new PrismaPriceHistoryRepository(db),
    marketStatistics: new PrismaMarketStatisticsRepository(db),
    comparables: new PrismaComparablePropertyRepository(db),
  };
}

export type EntityRepositories = ReturnType<typeof createEntityRepositories>;
