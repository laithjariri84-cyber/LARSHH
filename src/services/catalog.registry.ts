import type { ServiceResult } from "@/types";
import type { PaginatedResult, RepositoryQueryParams } from "@/types";
import type { Community, Building, Agent, Owner, Buyer, Tenant } from "@/types";

/**
 * Catalog services manage reference data — not aggregate roots.
 * Properties embed projections from these catalogs.
 */

export interface ICommunityCatalogService {
  getById(id: string): Promise<ServiceResult<Community>>;
  getBySlug(slug: string): Promise<ServiceResult<Community>>;
  list(query?: RepositoryQueryParams): Promise<ServiceResult<PaginatedResult<Community>>>;
}

export interface IBuildingCatalogService {
  getById(id: string): Promise<ServiceResult<Building>>;
  listByCommunity(communityId: string): Promise<ServiceResult<Building[]>>;
}

export interface IAgentDirectoryService {
  getById(id: string): Promise<ServiceResult<Agent>>;
  list(query?: RepositoryQueryParams): Promise<ServiceResult<PaginatedResult<Agent>>>;
}

export interface IOwnerDirectoryService {
  getById(id: string): Promise<ServiceResult<Owner>>;
  getPropertyPortfolio(ownerId: string): Promise<ServiceResult<string[]>>;
}

export interface IBuyerDirectoryService {
  getById(id: string): Promise<ServiceResult<Buyer>>;
}

export interface ITenantDirectoryService {
  getById(id: string): Promise<ServiceResult<Tenant>>;
}

export interface ICatalogServiceRegistry {
  communities: ICommunityCatalogService;
  buildings: IBuildingCatalogService;
  agents: IAgentDirectoryService;
  owners: IOwnerDirectoryService;
  buyers: IBuyerDirectoryService;
  tenants: ITenantDirectoryService;
}
