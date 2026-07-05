import type { Prisma } from "@prisma/client";
import { ListingStatus, ListingType } from "@prisma/client";

import type { PropertyDetailsRecord } from "@/lib/repositories/property.repository";
import { getAgentDisplayName } from "@/lib/repositories/property.repository";
import { formatCurrency, formatLabel } from "@/lib/utils";

import type {
  PropertyDetailsViewModel,
  PropertyTimelineEvent,
  SimilarPropertySummary,
} from "../types";

export type { PropertyDetailsRecord };

function pickPrimaryListing(listings: PropertyDetailsRecord["listings"]) {
  if (!listings.length) return null;
  return (
    listings.find(
      (l) =>
        l.status === ListingStatus.ACTIVE || l.status === ListingStatus.PENDING
    ) ?? listings[0]
  );
}

function pickListing<
  T extends {
    listingType: ListingType;
    status: ListingStatus;
    askingPrice: Prisma.Decimal;
    currency: string;
    updatedAt: Date;
    agent: PropertyDetailsRecord["listings"][number]["agent"];
  },
>(listings: T[], type: ListingType) {
  const matches = listings.filter((l) => l.listingType === type);
  return (
    matches.find((l) => l.status === ListingStatus.ACTIVE) ?? matches[0] ?? null
  );
}

function computePricePerSqFt(
  price: number | null,
  areaSqft: number | null
): number | null {
  if (!areaSqft || areaSqft <= 0 || !price) return null;
  return Math.round((price / areaSqft) * 100) / 100;
}

function buildTimeline(property: PropertyDetailsRecord): PropertyTimelineEvent[] {
  const events: PropertyTimelineEvent[] = [
    {
      id: `${property.id}-created`,
      type: "created",
      label: "Property created",
      description: "Property record added to LARSSH",
      occurredAt: property.createdAt,
    },
  ];

  if (property.updatedAt.getTime() > property.createdAt.getTime() + 1000) {
    events.push({
      id: `${property.id}-updated`,
      type: "updated",
      label: "Property updated",
      description: "Property details were modified",
      occurredAt: property.updatedAt,
    });
  }

  for (const listing of property.listings) {
    events.push({
      id: `${listing.id}-listed`,
      type: "price_changed",
      label: `${formatLabel(listing.listingType)} listing published`,
      description: `Listed at ${formatCurrency(Number(listing.askingPrice), "AED")}`,
      occurredAt: listing.publishedAt ?? listing.createdAt,
    });

    if (listing.updatedAt.getTime() > listing.createdAt.getTime() + 1000) {
      events.push({
        id: `${listing.id}-price-updated`,
        type: "price_changed",
        label: "Price changed",
        description: `${formatLabel(listing.listingType)} updated to ${formatCurrency(Number(listing.askingPrice), "AED")}`,
        occurredAt: listing.updatedAt,
      });

      events.push({
        id: `${listing.id}-status-updated`,
        type: "status_changed",
        label: "Status changed",
        description: `Listing status set to ${formatLabel(listing.status)}`,
        occurredAt: listing.updatedAt,
      });
    }
  }

  return events.sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()
  );
}

function mapSimilarProperty(
  property: Prisma.PropertyGetPayload<{
    include: {
      community: true;
      building: { include: { community: true } };
      listings: true;
    };
  }>
): SimilarPropertySummary {
  const rent = property.listings.find((l) => l.listingType === ListingType.RENT);
  const sale = property.listings.find((l) => l.listingType === ListingType.SALE);
  const primary = property.listings[0] ?? null;

  return {
    propertyId: property.id,
    community: property.community?.name ?? property.building?.community?.name ?? "Unknown",
    building: property.building.name,
    unitNumber: property.unitNumber,
    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    size: property.areaSqft ? Number(property.areaSqft) : null,
    askingRent: rent ? Number(rent.askingPrice) : null,
    askingSale: sale ? Number(sale.askingPrice) : null,
    listingType: primary?.listingType ?? rent?.listingType ?? sale?.listingType ?? null,
    status: primary?.status ?? null,
    currency: primary?.currency ?? "AED",
  };
}

export function mapPropertyToDetailsViewModel(
  property: PropertyDetailsRecord,
  similarProperties: SimilarPropertySummary[] = []
): PropertyDetailsViewModel {
  const primaryListing = pickPrimaryListing(property.listings);
  const rentListing = pickListing(property.listings, ListingType.RENT);
  const saleListing = pickListing(property.listings, ListingType.SALE);
  const areaSqft = property.areaSqft ? Number(property.areaSqft) : null;
  const askingRent = rentListing ? Number(rentListing.askingPrice) : null;
  const askingSale = saleListing ? Number(saleListing.askingPrice) : null;
  const askingPrice = primaryListing
    ? Number(primaryListing.askingPrice)
    : askingSale ?? askingRent;
  const currency = "AED";

  const agent = primaryListing?.agent;

  return {
    id: property.id,
    propertyCode: property.propertyCode,
    pfExpertReference: primaryListing?.pfExpertReference ?? null,
    masterCommunity: property.masterCommunity?.name ?? null,
    community: property.community?.name ?? property.building?.community?.name ?? "Unknown",
    building: property.building.name,
    unitNumber: property.unitNumber,
    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms ? Number(property.bathrooms) : null,
    size: areaSqft,
    listingStatus: primaryListing?.status ?? null,
    listingType: primaryListing?.listingType ?? null,
    marketingTitle: primaryListing?.marketingTitle ?? null,
    description: primaryListing?.description?.trim() ?? null,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    listingPublishedAt: primaryListing?.publishedAt ?? null,
    listingUpdatedAt: primaryListing?.updatedAt ?? null,
    pricing: {
      askingPrice,
      askingRent,
      askingSale,
      pricePerSqFt: computePricePerSqFt(askingPrice, areaSqft),
      lastUpdated: primaryListing?.updatedAt ?? property.updatedAt,
      currency,
    },
    information: {
      view: property.view,
      furnishing: property.furnishing,
      floor: property.floor,
      completionYear: property.building.yearBuilt,
    },
    agent: agent
      ? {
          id: agent.id,
          fullName: getAgentDisplayName(agent) ?? "Unknown Agent",
          email: agent.user?.email ?? null,
          phone: agent.phone,
          agencyName: agent.agencyName,
          licenseNumber: agent.licenseNumber,
        }
      : null,
    photos: mapPropertyPhotos(property),
    floorPlans: property.floorPlans.map((plan) => ({
      id: plan.id,
      url: plan.url,
      title: plan.title,
    })),
    timeline: buildTimeline(property),
    similarProperties,
    marketIntelligence: null,
    internalNotes: property.notes.map((note) => ({
      id: note.id,
      body: note.body,
      isPinned: note.isPinned,
      authorName: note.author?.fullName ?? "LARSSH Team",
      createdAt: note.createdAt,
    })),
  };
}

export { mapSimilarProperty };

function mapPropertyPhotos(
  property: PropertyDetailsRecord
): PropertyDetailsViewModel["photos"] {
  if (property.propertyImages.length > 0) {
    return property.propertyImages.map((image) => ({
      id: image.id,
      url: image.imageUrl,
      thumbnailUrl: image.imageUrl,
      caption: null,
      isPrimary: image.isCover,
      storagePath: image.storagePath,
      displayOrder: image.displayOrder,
      uploadedAt: image.uploadedAt,
    }));
  }

  return property.photos.map((photo) => ({
    id: photo.id,
    url: photo.url,
    thumbnailUrl: photo.thumbnailUrl,
    caption: photo.caption,
    isPrimary: photo.isPrimary,
  }));
}
