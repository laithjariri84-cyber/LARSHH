import {
  fetchSearchPageData,
  getBuildingOptions as getBuildingOptionsFromDb,
  getCommunityOptions as getCommunityOptionsFromDb,
  getAllProperties as getAllPropertiesFromDb,
  searchProperties as searchPropertiesFromDb,
  getPropertyById as getPropertyByIdFromDb,
} from "@/lib/repositories/property.repository";
import { rscTry } from "@/lib/rsc-debug";

import type { SearchFiltersInput } from "../schemas/search-filters.schema";
import type { FilterOption } from "../types";
import { mapPropertiesToSearchResults } from "../mappers/search.mapper";

function mapSearchResultsSafely(
  properties: Awaited<ReturnType<typeof getAllPropertiesFromDb>>
) {
  try {
    return mapPropertiesToSearchResults(properties);
  } catch (error) {
    console.error("[RSC ERROR] scope=search-properties:mapPropertiesToSearchResults", error);
    throw error;
  }
}

export async function getAllProperties() {
  return rscTry("search-properties:getAllProperties", async () => {
    const properties = await getAllPropertiesFromDb();
    return mapSearchResultsSafely(properties);
  });
}

export async function searchProperties(filters: SearchFiltersInput = {}) {
  return rscTry("search-properties:searchProperties", async () => {
    const properties = await searchPropertiesFromDb(filters);
    return mapSearchResultsSafely(properties);
  });
}

export async function loadSearchPageData(filters: SearchFiltersInput = {}) {
  return rscTry("search-properties:loadSearchPageData", async () => {
    const { properties, communities, buildings } =
      await fetchSearchPageData(filters);

    return {
      results: mapSearchResultsSafely(properties),
      communities: communities.map((c) => ({ value: c.id, label: c.name })),
      buildings: buildings.map((b) => ({ value: b.id, label: b.name })),
    };
  });
}

export async function getPropertyById(id: string) {
  return rscTry("search-properties:getPropertyById", () =>
    getPropertyByIdFromDb(id)
  );
}

export async function getCommunityOptions(): Promise<FilterOption[]> {
  return rscTry("search-properties:getCommunityOptions", async () => {
    const communities = await getCommunityOptionsFromDb();
    return communities.map((c) => ({ value: c.id, label: c.name }));
  });
}

export async function getBuildingOptions(
  communityId?: string
): Promise<FilterOption[]> {
  return rscTry("search-properties:getBuildingOptions", async () => {
    const buildings = await getBuildingOptionsFromDb(communityId);
    return buildings.map((b) => ({ value: b.id, label: b.name }));
  });
}
