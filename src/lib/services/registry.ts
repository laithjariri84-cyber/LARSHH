import { getRepositoryRegistry } from "@/lib/database/client";
import { PropertyDomainService } from "@/lib/services/property-domain.service.impl";
import type { IServiceRegistry } from "@/services/service-registry";
import type { IPropertyDomainService } from "@/services/property-domain.service";

let serviceRegistry: IServiceRegistry | null = null;

function buildCatalogServices() {
  const repos = getRepositoryRegistry().catalog;
  return {
    communities: {
      getById: async (id: string) => {
        const row = await repos.communities.findById(id);
        return row
          ? { ok: true as const, data: row }
          : {
              ok: false as const,
              error: {
                code: "NOT_FOUND" as const,
                message: "Community not found",
              },
            };
      },
      getBySlug: async (slug: string) => {
        const row = await repos.communities.findBySlug(slug);
        return row
          ? { ok: true as const, data: row }
          : {
              ok: false as const,
              error: {
                code: "NOT_FOUND" as const,
                message: "Community not found",
              },
            };
      },
      list: async (
        query?: Parameters<typeof repos.communities.findMany>[0]
      ) => ({
        ok: true as const,
        data: await repos.communities.findMany(query),
      }),
    },
    buildings: {
      getById: async (id: string) => {
        const row = await repos.buildings.findById(id);
        return row
          ? { ok: true as const, data: row }
          : {
              ok: false as const,
              error: {
                code: "NOT_FOUND" as const,
                message: "Building not found",
              },
            };
      },
      listByCommunity: async (communityId: string) => ({
        ok: true as const,
        data: await repos.buildings.findByCommunity(communityId),
      }),
    },
    agents: {
      getById: async (id: string) => {
        const row = await repos.agents.findById(id);
        return row
          ? { ok: true as const, data: row }
          : {
              ok: false as const,
              error: { code: "NOT_FOUND" as const, message: "Agent not found" },
            };
      },
      list: async (query?: Parameters<typeof repos.agents.findMany>[0]) => ({
        ok: true as const,
        data: await repos.agents.findMany(query),
      }),
    },
    owners: {
      getById: async (id: string) => {
        const row = await repos.owners.findById(id);
        return row
          ? { ok: true as const, data: row }
          : {
              ok: false as const,
              error: { code: "NOT_FOUND" as const, message: "Owner not found" },
            };
      },
      getPropertyPortfolio: async (ownerId: string) => ({
        ok: true as const,
        data: await repos.owners.findPropertyIds(ownerId),
      }),
    },
    buyers: {
      getById: async (id: string) => {
        const row = await repos.buyers.findById(id);
        return row
          ? { ok: true as const, data: row }
          : {
              ok: false as const,
              error: { code: "NOT_FOUND" as const, message: "Buyer not found" },
            };
      },
    },
    tenants: {
      getById: async (id: string) => {
        const row = await repos.tenants.findById(id);
        return row
          ? { ok: true as const, data: row }
          : {
              ok: false as const,
              error: {
                code: "NOT_FOUND" as const,
                message: "Tenant not found",
              },
            };
      },
    },
  };
}

export function getPropertyService(): IPropertyDomainService {
  return new PropertyDomainService(getRepositoryRegistry().property);
}

export function getServices(): IServiceRegistry {
  if (!serviceRegistry) {
    serviceRegistry = {
      property: getPropertyService(),
      catalog: buildCatalogServices(),
    };
  }
  return serviceRegistry;
}

export function getRepositories() {
  return getRepositoryRegistry();
}
