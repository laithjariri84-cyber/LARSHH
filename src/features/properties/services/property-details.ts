import { ListingStatus, ListingType } from "@prisma/client";
import { cache } from "react";

import {
  getPropertyById as getPropertyByIdFromDb,
  getSimilarProperties as getSimilarPropertiesFromDb,
} from "@/lib/repositories/property.repository";
import { computePropertyMarketIntelligence } from "@/server/market-intelligence";
import { rscTry } from "@/lib/rsc-debug";

import {
  mapPropertyToDetailsViewModel,
  mapSimilarProperty,
} from "../mappers/property-details.mapper";
import type { PropertyDetailsViewModel } from "../types";

function pickSimilarListingPrice(
  property: NonNullable<Awaited<ReturnType<typeof getPropertyByIdFromDb>>>
) {
  const active =
    property.listings.find(
      (l) =>
        l.status === ListingStatus.ACTIVE || l.status === ListingStatus.PENDING
    ) ?? property.listings[0];

  return {
    askingPrice: active ? Number(active.askingPrice) : null,
    listingType: active?.listingType ?? null,
  };
}

function pickListingPrice(
  property: NonNullable<Awaited<ReturnType<typeof getPropertyByIdFromDb>>>,
  type: ListingType
) {
  const listing = property.listings.find((l) => l.listingType === type);
  return listing ? Number(listing.askingPrice) : null;
}

function resolveCommunityName(
  property: NonNullable<Awaited<ReturnType<typeof getPropertyByIdFromDb>>>
) {
  return property.community?.name ?? property.building?.community?.name ?? "Unknown";
}

async function loadPropertyDetailsById(
  id: string
): Promise<PropertyDetailsViewModel | null> {
  const property = await getPropertyByIdFromDb(id);
  if (!property) return null;

  const { askingPrice, listingType } = pickSimilarListingPrice(property);
  const communityName = resolveCommunityName(property);
  const askingRent = pickListingPrice(property, ListingType.RENT);
  const askingSale = pickListingPrice(property, ListingType.SALE);

  const [similarRecords, marketIntelligence] = await Promise.all([
    getSimilarPropertiesFromDb({
      propertyId: property.id,
      communityId: property.communityId,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms,
      areaSqft: property.areaSqft ? Number(property.areaSqft) : null,
      askingPrice,
      listingType,
    }),
    computePropertyMarketIntelligence({
      communityName,
      bedrooms: property.bedrooms,
      listingType,
      furnishing: property.furnishing,
      askingPrice,
      askingRent,
      askingSale,
    }),
  ]);

  const viewModel = mapPropertyToDetailsViewModel(
    property,
    similarRecords.map(mapSimilarProperty)
  );

  return {
    ...viewModel,
    marketIntelligence,
  };
}

export const getPropertyDetailsById = cache(async (id: string) => {
  return rscTry("getPropertyDetailsById", () => loadPropertyDetailsById(id));
});

export async function getPropertyDetailsRecord(id: string) {
  return rscTry("property-details:getPropertyDetailsRecord", () =>
    getPropertyByIdFromDb(id)
  );
}
