import {
  fetchSearchPageData,
  getBuildingOptions as getBuildingOptionsFromDb,
  getCommunityOptions as getCommunityOptionsFromDb,
  getAllProperties as getAllPropertiesFromDb,
  searchProperties as searchPropertiesFromDb,
  getPropertyById as getPropertyByIdFromDb,
} from "@/lib/repositories/property.repository";

import type { SearchFiltersInput } from "../schemas/search-filters.schema";
import type { FilterOption } from "../types";
import { mapPropertiesToSearchResults } from "../mappers/search.mapper";

export async function getAllProperties() {
  const properties = await getAllPropertiesFromDb();
  return mapPropertiesToSearchResults(properties);
}

export async function searchProperties(filters: SearchFiltersInput = {}) {
  const properties = await searchPropertiesFromDb(filters);
  return mapPropertiesToSearchResults(properties);
}

export async function loadSearchPageData(filters: SearchFiltersInput = {}) {
  const { properties, communities, buildings } =
    await fetchSearchPageData(filters);

  return {
    results: mapPropertiesToSearchResults(properties),
    communities: communities.map((c) => ({ value: c.id, label: c.name })),
    buildings: buildings.map((b) => ({ value: b.id, label: b.name })),
  };
}

export async function getPropertyById(id: string) {
  return getPropertyByIdFromDb(id);
}

export async function getCommunityOptions(): Promise<FilterOption[]> {
  const communities = await getCommunityOptionsFromDb();
  return communities.map((c) => ({ value: c.id, label: c.name }));
}

export async function getBuildingOptions(
  communityId?: string
): Promise<FilterOption[]> {
  const buildings = await getBuildingOptionsFromDb(communityId);
  return buildings.map((b) => ({ value: b.id, label: b.name }));
}
