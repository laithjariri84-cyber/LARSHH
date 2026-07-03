import type {
  CreatePropertyAggregateInput,
  PropertyAggregate,
  PropertyAggregatePatch,
  PropertyLoadOptions,
  PropertyLoadProfile,
  PropertySummary,
} from "@/domain/property";
import { PROPERTY_LOAD_PROFILES } from "@/domain/property";
import type {
  PaginatedResult,
  PropertyFilterParams,
  PropertySearchParams,
} from "@/types";
import type { RepositoryQueryParams } from "@/types/repository";
import type { ServiceErrorCode, ServiceResult } from "@/types/service";
import type { IPropertyDomainService } from "@/services/property-domain.service";
import type { IPropertyAggregateRepository } from "@/repositories/property/aggregate.repository";

function ok<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

function fail(code: ServiceErrorCode, message: string): ServiceResult<never> {
  return { ok: false, error: { code, message } };
}

export class PropertyDomainService implements IPropertyDomainService {
  constructor(
    private readonly propertyRepo: IPropertyAggregateRepository
  ) {}

  async create(input: CreatePropertyAggregateInput) {
    try {
      const aggregate = await this.propertyRepo.create(input);
      return ok(aggregate);
    } catch (error) {
      return fail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Failed to create property"
      );
    }
  }

  async getById(propertyId: string, options?: PropertyLoadOptions) {
    const aggregate = await this.propertyRepo.load(propertyId, options);
    if (!aggregate) return fail("NOT_FOUND", "Property not found");
    return ok(aggregate);
  }

  async getByCode(propertyCode: string, options?: PropertyLoadOptions) {
    const aggregate = await this.propertyRepo.loadByCode(propertyCode, options);
    if (!aggregate) return fail("NOT_FOUND", "Property not found");
    return ok(aggregate);
  }

  async getByProfile(propertyId: string, profile: PropertyLoadProfile) {
    return this.getById(propertyId, { profile });
  }

  async update(propertyId: string, patch: PropertyAggregatePatch) {
    try {
      const aggregate = await this.propertyRepo.patch(propertyId, patch);
      return ok(aggregate);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Record to update not found")
      ) {
        return fail("CONFLICT", "Property was modified by another user");
      }
      return fail(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Failed to update property"
      );
    }
  }

  async remove(propertyId: string) {
    const existing = await this.propertyRepo.load(propertyId, {
      profile: "summary",
    });
    if (!existing) return fail("NOT_FOUND", "Property not found");
    await this.propertyRepo.delete(propertyId);
    return ok(undefined);
  }

  async search(params: PropertySearchParams, query?: RepositoryQueryParams) {
    const result = await this.propertyRepo.search(params, query);
    return ok(result);
  }

  async filter(params: PropertyFilterParams, query?: RepositoryQueryParams) {
    const result = await this.propertyRepo.filter(params, query);
    return ok(result);
  }

  async list(query?: RepositoryQueryParams) {
    const result = await this.propertyRepo.findMany(query);
    return ok(result);
  }

  async getComparables(propertyId: string, limit?: number) {
    const existing = await this.propertyRepo.load(propertyId, {
      profile: "summary",
    });
    if (!existing) return fail("NOT_FOUND", "Property not found");
    const comps = await this.propertyRepo.findComparables(propertyId, limit);
    return ok(comps);
  }

  async getSimilar(propertyId: string, limit?: number) {
    const existing = await this.propertyRepo.load(propertyId, {
      profile: "summary",
    });
    if (!existing) return fail("NOT_FOUND", "Property not found");
    const similar = await this.propertyRepo.findSimilar(propertyId, limit);
    return ok(similar);
  }

  async refreshMarketIntelligence(propertyId: string) {
    const existing = await this.propertyRepo.load(propertyId, {
      profile: "summary",
    });
    if (!existing) return fail("NOT_FOUND", "Property not found");

    await this.propertyRepo.refreshMarketData(propertyId);
    await this.propertyRepo.refreshComparables(propertyId);

    const aggregate = await this.propertyRepo.load(propertyId, {
      profile: "intelligence",
    });
    if (!aggregate) return fail("NOT_FOUND", "Property not found");
    return ok(aggregate);
  }

  async getSearchFilterOptions() {
    const options = await this.propertyRepo.getSearchFilterOptions();
    return ok(options);
  }

  async scheduleViewing(propertyId: string, input: unknown) {
    void input;
    const aggregate = await this.propertyRepo.load(propertyId, {
      sections: [...PROPERTY_LOAD_PROFILES.detail],
    });
    if (!aggregate) return fail("NOT_FOUND", "Property not found");
    return ok(aggregate);
  }

  async recordOffer(propertyId: string, input: unknown) {
    void input;
    const aggregate = await this.propertyRepo.load(propertyId, {
      sections: [...PROPERTY_LOAD_PROFILES.detail],
    });
    if (!aggregate) return fail("NOT_FOUND", "Property not found");
    return ok(aggregate);
  }

  async addNote(propertyId: string, body: string) {
    void body;
    const aggregate = await this.propertyRepo.load(propertyId, {
      sections: [...PROPERTY_LOAD_PROFILES.detail],
    });
    if (!aggregate) return fail("NOT_FOUND", "Property not found");
    return ok(aggregate);
  }
}
