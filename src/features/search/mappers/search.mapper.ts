import { ListingStatus, ListingType } from "@prisma/client";

import type { PropertySearchRecord } from "@/lib/repositories/property.repository";
import { getAgentDisplayName } from "@/lib/repositories/property.repository";
import type { PropertySearchResult } from "../types";

function pickListing(
  listings: PropertySearchRecord["listings"],
  type: ListingType
) {
  const preferred = listings.filter((l) => l.listingType === type);
  return (
    preferred.find((l) => l.status === ListingStatus.ACTIVE) ?? preferred[0] ?? null
  );
}

function resolveListingPricePerSqft(
  listing: PropertySearchRecord["listings"][number] | null,
  areaSqft: number | null
): number | null {
  if (!listing) return null;

  if (listing.pricePerSqft !== null && listing.pricePerSqft !== undefined) {
    return Number(listing.pricePerSqft);
  }

  if (!areaSqft || areaSqft <= 0) return null;
  return Math.round((Number(listing.askingPrice) / areaSqft) * 100) / 100;
}

export function mapPropertyToSearchResult(
  property: PropertySearchRecord
): PropertySearchResult {
  const rentListing = pickListing(property.listings, ListingType.RENT);
  const saleListing = pickListing(property.listings, ListingType.SALE);
  const primaryListing = property.listings[0] ?? null;
  const activeListing =
    property.listings.find(
      (l) => l.status === ListingStatus.ACTIVE || l.status === ListingStatus.PENDING
    ) ?? primaryListing;
  const pricingListing = saleListing ?? rentListing ?? activeListing;
  const currency =
    saleListing?.currency ??
    rentListing?.currency ??
    primaryListing?.currency ??
    "AED";
  const size = property.areaSqft ? Number(property.areaSqft) : null;

  return {
    propertyId: property.id,
    propertyCode: property.propertyCode,
    community: property.community?.name ?? property.building.community.name,
    building: property.building.name,
    unitNumber: property.unitNumber,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms ? Number(property.bathrooms) : null,
    size,
    view: property.view,
    furnishing: property.furnishing,
    askingRent: rentListing ? Number(rentListing.askingPrice) : null,
    askingSale: saleListing ? Number(saleListing.askingPrice) : null,
    listingType: primaryListing?.listingType ?? null,
    assignedAgent: getAgentDisplayName(primaryListing?.agent),
    status: primaryListing?.status ?? null,
    lastUpdated: primaryListing?.updatedAt ?? property.updatedAt,
    propertyType: property.propertyType,
    currency,
    pricePerSqft: resolveListingPricePerSqft(pricingListing, size),
    estimatedRoiPercent: null,
  };
}

export function mapPropertiesToSearchResults(
  properties: PropertySearchRecord[]
): PropertySearchResult[] {
  return properties.map(mapPropertyToSearchResult);
}
