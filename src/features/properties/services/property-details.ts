import {
  getPropertyById as getPropertyByIdFromDb,
  getSimilarProperties as getSimilarPropertiesFromDb,
} from "@/lib/repositories/property.repository";
import { computePropertyMarketIntelligence } from "@/server/market-intelligence";
import { ListingStatus } from "@prisma/client";
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

export async function getPropertyDetailsById(
  id: string
): Promise<PropertyDetailsViewModel | null> {
  return rscTry("property-details:getPropertyDetailsById", async () => {
    const property = await getPropertyByIdFromDb(id);
    if (!property) return null;

    const { askingPrice, listingType } = pickSimilarListingPrice(property);

    const similarRecords = await getSimilarPropertiesFromDb({
      propertyId: property.id,
      communityId: property.communityId,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms,
      areaSqft: property.areaSqft ? Number(property.areaSqft) : null,
      askingPrice,
      listingType,
    });

    const viewModel = mapPropertyToDetailsViewModel(
      property,
      similarRecords.map(mapSimilarProperty)
    );

    const marketIntelligence = await computePropertyMarketIntelligence({
      communityName: viewModel.community,
      bedrooms: viewModel.bedrooms,
      listingType: viewModel.listingType,
      furnishing: viewModel.information.furnishing,
      askingPrice: viewModel.pricing.askingPrice,
      askingRent: viewModel.pricing.askingRent,
      askingSale: viewModel.pricing.askingSale,
    });

    return {
      ...viewModel,
      marketIntelligence,
    };
  });
}

export async function getPropertyDetailsRecord(id: string) {
  return rscTry("property-details:getPropertyDetailsRecord", () =>
    getPropertyByIdFromDb(id)
  );
}
