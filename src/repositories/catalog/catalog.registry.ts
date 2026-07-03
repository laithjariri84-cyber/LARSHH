import type { Community, Building, Agent, Owner, Buyer, Tenant } from "@/types";
import type {
  PaginatedResult,
  RepositoryQueryParams,
} from "@/types";

/**
 * Reference catalogs — NOT aggregate roots.
 *
 * Decision: Community, Building, Agent, Owner, Buyer, Tenant exist as
 * directories that Properties reference by ID. They are loaded as projections
 * inside PropertyAggregate.community / .owner / .agentAssignment but are
 * managed through separate catalog repositories for admin CRUD and CRM actor
 * management.
 *
 * No feature should treat a Listing, Deal, or Viewing as independent of Property.
 */

export interface ICommunityCatalogRepository {
  findById(id: string): Promise<Community | null>;
  findBySlug(slug: string): Promise<Community | null>;
  findMany(query?: RepositoryQueryParams): Promise<PaginatedResult<Community>>;
}

export interface IBuildingCatalogRepository {
  findById(id: string): Promise<Building | null>;
  findByCommunity(communityId: string): Promise<Building[]>;
  findMany(query?: RepositoryQueryParams): Promise<PaginatedResult<Building>>;
}

export interface IAgentDirectoryRepository {
  findById(id: string): Promise<Agent | null>;
  findByEmail(email: string): Promise<Agent | null>;
  findMany(query?: RepositoryQueryParams): Promise<PaginatedResult<Agent>>;
}

export interface IOwnerDirectoryRepository {
  findById(id: string): Promise<Owner | null>;
  findPropertyIds(ownerId: string): Promise<string[]>;
  findMany(query?: RepositoryQueryParams): Promise<PaginatedResult<Owner>>;
}

export interface IBuyerDirectoryRepository {
  findById(id: string): Promise<Buyer | null>;
  findMany(query?: RepositoryQueryParams): Promise<PaginatedResult<Buyer>>;
}

export interface ITenantDirectoryRepository {
  findById(id: string): Promise<Tenant | null>;
  findMany(query?: RepositoryQueryParams): Promise<PaginatedResult<Tenant>>;
}

export interface ICatalogRepositoryRegistry {
  communities: ICommunityCatalogRepository;
  buildings: IBuildingCatalogRepository;
  agents: IAgentDirectoryRepository;
  owners: IOwnerDirectoryRepository;
  buyers: IBuyerDirectoryRepository;
  tenants: ITenantDirectoryRepository;
}
