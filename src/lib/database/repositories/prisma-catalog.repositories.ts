import type { Prisma, PrismaClient } from "@prisma/client";

import type {
  Agent,
  Building,
  Buyer,
  Community,
  Owner,
  Tenant,
} from "@/types";
import type {
  CreateAgentInput,
  CreateBuildingInput,
  CreateBuyerInput,
  CreateCommunityInput,
  CreateOwnerInput,
  CreateTenantInput,
  UpdateAgentInput,
  UpdateBuildingInput,
  UpdateBuyerInput,
  UpdateCommunityInput,
  UpdateOwnerInput,
  UpdateTenantInput,
} from "@/types/inputs";
import type {
  AgentFilterParams,
  AgentSearchParams,
  BuildingFilterParams,
  BuildingSearchParams,
  BuyerFilterParams,
  BuyerSearchParams,
  CommunityFilterParams,
  CommunitySearchParams,
  OwnerFilterParams,
  OwnerSearchParams,
  TenantFilterParams,
  TenantSearchParams,
} from "@/types/filters";
import type { PaginatedResult } from "@/types";
import type { RepositoryQueryParams } from "@/types/repository";
import type {
  IAgentDirectoryRepository,
  IBuildingCatalogRepository,
  IBuyerDirectoryRepository,
  ICommunityCatalogRepository,
  IOwnerDirectoryRepository,
  ITenantDirectoryRepository,
} from "@/repositories/catalog/catalog.registry";

import { decimalToNumber } from "../utils/decimal";
import { buildOrderBy, toPaginated, toSkipTake } from "../utils/pagination";

function mapCommunity(row: Prisma.CommunityGetPayload<object>): Community {
  return {
    ...row,
    latitude: decimalToNumber(row.latitude),
    longitude: decimalToNumber(row.longitude),
  } as Community;
}

export class PrismaCommunityCatalogRepository
  implements ICommunityCatalogRepository
{
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    const row = await this.db.community.findUnique({ where: { id } });
    return row ? mapCommunity(row) : null;
  }

  async findBySlug(slug: string) {
    const row = await this.db.community.findFirst({ where: { slug } });
    return row ? mapCommunity(row) : null;
  }

  async findMany(
    query?: RepositoryQueryParams
  ): Promise<PaginatedResult<Community>> {
    const { page, pageSize, skip, take } = toSkipTake(query);
    const [total, rows] = await this.db.$transaction([
      this.db.community.count(),
      this.db.community.findMany({
        orderBy: buildOrderBy(query, "name", [
          "name",
          "createdAt",
          "updatedAt",
          "city",
        ]),
        skip,
        take,
      }),
    ]);
    return toPaginated(rows.map(mapCommunity), total, page, pageSize);
  }
}

export class PrismaBuildingCatalogRepository
  implements IBuildingCatalogRepository
{
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    return this.db.building.findUnique({ where: { id } });
  }

  async findByCommunity(communityId: string) {
    return this.db.building.findMany({
      where: { communityId },
      orderBy: { name: "asc" },
    });
  }

  async findMany(
    query?: RepositoryQueryParams
  ): Promise<PaginatedResult<Building>> {
    const { page, pageSize, skip, take } = toSkipTake(query);
    const [total, rows] = await this.db.$transaction([
      this.db.building.count(),
      this.db.building.findMany({
        orderBy: buildOrderBy(query, "name", [
          "name",
          "createdAt",
          "updatedAt",
          "city",
        ]),
        skip,
        take,
      }),
    ]);
    return toPaginated(rows, total, page, pageSize);
  }
}

export class PrismaAgentDirectoryRepository implements IAgentDirectoryRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    return this.db.agent.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.db.agent.findFirst({ where: { user: { email } } });
  }

  async findMany(query?: RepositoryQueryParams): Promise<PaginatedResult<Agent>> {
    const { page, pageSize, skip, take } = toSkipTake(query);
    const [total, rows] = await this.db.$transaction([
      this.db.agent.count(),
      this.db.agent.findMany({
        include: { user: true },
        orderBy: buildOrderBy(
          query,
          "fullName",
          ["createdAt", "updatedAt", "agencyName", "fullName"],
          (field, order) =>
            field === "fullName" ? { user: { fullName: order } } : null
        ),
        skip,
        take,
      }),
    ]);
    return toPaginated(rows, total, page, pageSize);
  }
}

export class PrismaOwnerDirectoryRepository implements IOwnerDirectoryRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    return this.db.owner.findUnique({ where: { id } });
  }

  async findPropertyIds(ownerId: string) {
    const rows = await this.db.property.findMany({
      where: { ownerId, deletedAt: null },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }

  async findMany(query?: RepositoryQueryParams): Promise<PaginatedResult<Owner>> {
    const { page, pageSize, skip, take } = toSkipTake(query);
    const [total, rows] = await this.db.$transaction([
      this.db.owner.count(),
      this.db.owner.findMany({
        orderBy: buildOrderBy(query, "fullName", [
          "fullName",
          "email",
          "createdAt",
          "updatedAt",
        ]),
        skip,
        take,
      }),
    ]);
    return toPaginated(rows, total, page, pageSize);
  }
}

export class PrismaBuyerDirectoryRepository implements IBuyerDirectoryRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    return this.db.buyer.findUnique({ where: { id } });
  }

  async findMany(query?: RepositoryQueryParams): Promise<PaginatedResult<Buyer>> {
    const { page, pageSize, skip, take } = toSkipTake(query);
    const [total, rows] = await this.db.$transaction([
      this.db.buyer.count(),
      this.db.buyer.findMany({
        orderBy: buildOrderBy(query, "fullName", [
          "fullName",
          "email",
          "createdAt",
          "updatedAt",
        ]),
        skip,
        take,
      }),
    ]);
    return toPaginated(rows, total, page, pageSize);
  }
}

export class PrismaTenantDirectoryRepository implements ITenantDirectoryRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    return this.db.tenant.findUnique({ where: { id } });
  }

  async findMany(query?: RepositoryQueryParams): Promise<PaginatedResult<Tenant>> {
    const { page, pageSize, skip, take } = toSkipTake(query);
    const [total, rows] = await this.db.$transaction([
      this.db.tenant.count(),
      this.db.tenant.findMany({
        orderBy: buildOrderBy(query, "fullName", [
          "fullName",
          "email",
          "createdAt",
          "updatedAt",
        ]),
        skip,
        take,
      }),
    ]);
    return toPaginated(rows, total, page, pageSize);
  }
}

export function createCatalogRepositories(db: PrismaClient) {
  return {
    communities: new PrismaCommunityCatalogRepository(db),
    buildings: new PrismaBuildingCatalogRepository(db),
    agents: new PrismaAgentDirectoryRepository(db),
    owners: new PrismaOwnerDirectoryRepository(db),
    buyers: new PrismaBuyerDirectoryRepository(db),
    tenants: new PrismaTenantDirectoryRepository(db),
  };
}
