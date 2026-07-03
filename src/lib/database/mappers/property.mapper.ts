import type {
  Agent,
  Building,
  Community,
  ComparableProperty,
  Deal,
  Listing,
  MarketStatistics,
  MasterCommunity,
  Offer,
  Owner,
  PriceHistory,
  Property,
  Task,
  Viewing,
} from "@prisma/client";

import type {
  PropertyAggregate,
  PropertyAggregateSection,
  PropertySummary,
} from "@/domain/property";
import { resolveLoadSections } from "@/domain/property";
import type { PropertyLoadOptions } from "@/domain/property";

import { ACTIVE_LISTING_STATUSES } from "../includes/property.include";
import { decimalToNumber } from "../utils/decimal";

type PropertyWithRelations = Property & {
  masterCommunity?: MasterCommunity | null;
  community?: Community | null;
  building: Building & { community: Community };
  owner?: Owner | null;
  listings?: (Listing & { agent?: Agent | null })[];
  priceHistory?: PriceHistory[];
  offers?: Offer[];
  viewings?: Viewing[];
  tasks?: Task[];
  marketStatistics?: MarketStatistics[];
  subjectComparables?: (ComparableProperty & {
    compProperty: Property & {
      building: Building & { community: Community };
      listings?: Listing[];
    };
    compListing?: Listing | null;
  })[];
};

function mapListingRecord(
  listing: Listing & { agent?: Agent | null }
) {
  return {
    id: listing.id,
    marketingTitle: listing.marketingTitle,
    description: listing.description,
    askingPrice: decimalToNumber(listing.askingPrice) ?? 0,
    currency: listing.currency,
    listingType: listing.listingType,
    status: listing.status,
    agentId: listing.agentId,
    publishedAt: listing.publishedAt,
    expiresAt: listing.expiresAt,
    pfExpertReference: listing.pfExpertReference,
    salesforceId: listing.salesforceId,
    qualityScore: decimalToNumber(listing.qualityScore),
    soldAt: listing.soldAt,
    daysOnMarket: listing.daysOnMarket,
    pricePerSqft: decimalToNumber(listing.pricePerSqft),
    marketDifferencePercent: decimalToNumber(listing.marketDifferencePercent),
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

function getCurrentListing(
  listings: (Listing & { agent?: Agent | null })[] | undefined
) {
  if (!listings?.length) return null;
  return (
    listings.find((l) =>
      ACTIVE_LISTING_STATUSES.includes(
        l.status as (typeof ACTIVE_LISTING_STATUSES)[number]
      )
    ) ?? listings[0]
  );
}

function mapAgentAssignment(
  listing: (Listing & { agent?: (Agent & { user?: { fullName: string | null; email: string } | null }) | null }) | null | undefined
) {
  if (!listing?.agent) return null;
  return {
    agentId: listing.agent.id,
    fullName: listing.agent.user?.fullName ?? "Unknown Agent",
    email: listing.agent.user?.email ?? null,
    phone: listing.agent.phone,
    licenseNumber: listing.agent.licenseNumber,
    assignedAt: listing.publishedAt ?? listing.updatedAt,
  };
}

function mapMarketStatistics(stats: MarketStatistics | null | undefined) {
  if (!stats) return null;
  return {
    scopeKey: `${stats.scopeType}:${stats.scopeId}`,
    computedAt: stats.computedAt,
    averageAskingPrice: decimalToNumber(stats.avgAskingPrice),
    averagePricePerSqft: decimalToNumber(stats.avgPricePerSqft),
    averageRent: decimalToNumber(stats.avgRent),
    averageRoi: decimalToNumber(stats.avgRoi),
    averageDaysOnMarket: stats.avgDaysOnMarket,
    medianPrice: decimalToNumber(stats.medianPrice),
    lowestPrice: decimalToNumber(stats.lowestPrice),
    highestPrice: decimalToNumber(stats.highestPrice),
    supplyLevel: stats.supplyLevel,
    demandLevel: stats.demandLevel,
    marketConfidence: decimalToNumber(stats.marketConfidence),
    activeListingsCount: stats.activeListingsCount,
  };
}

function mapRoi(stats: MarketStatistics | null | undefined) {
  if (!stats?.avgRoi) return null;
  return {
    grossRentalYield: decimalToNumber(stats.avgRoi),
    netRentalYield: null,
    estimatedAnnualRent: decimalToNumber(stats.avgRent),
    estimatedCapitalAppreciation: null,
    investmentScore: decimalToNumber(stats.marketConfidence),
    computedAt: stats.computedAt,
  };
}

function mapCore(record: PropertyWithRelations) {
  const { building } = record;
  const community = record.community ?? building.community;
  const masterCommunity = record.masterCommunity;

  return {
    identity: {
      id: record.id,
      propertyCode: record.propertyCode,
      unitNumber: record.unitNumber,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    },
    location: {
      buildingId: record.buildingId,
      communityId: record.communityId,
      masterCommunityName: masterCommunity?.name ?? null,
      floor: record.floor,
      addressLine1: building.addressLine1,
      addressLine2: building.addressLine2,
      city: building.city,
      state: building.state,
      postalCode: building.postalCode,
      country: building.country,
      latitude: decimalToNumber(record.latitude),
      longitude: decimalToNumber(record.longitude),
    },
    community: {
      id: community.id,
      name: community.name,
      slug: community.slug,
      masterName: masterCommunity?.name ?? null,
      description: community.description,
    },
    building: {
      id: building.id,
      name: building.name,
      code: building.code,
      totalFloors: building.totalFloors,
      yearBuilt: building.yearBuilt,
    },
    specification: {
      areaSqft: decimalToNumber(record.areaSqft),
      bedrooms: record.bedrooms,
      bathrooms: decimalToNumber(record.bathrooms),
      propertyType: record.propertyType,
      furnishing: record.furnishing,
      view: record.view,
    },
  };
}

export function mapPropertyToSummary(
  record: PropertyWithRelations
): PropertySummary {
  const core = mapCore(record);
  const current = getCurrentListing(record.listings);
  const latestStats = record.marketStatistics?.[0] ?? null;

  return {
    identity: core.identity,
    location: core.location,
    community: core.community,
    building: core.building,
    specification: core.specification,
    currentListing: current ? mapListingRecord(current) : null,
    agentAssignment: mapAgentAssignment(current),
    market: {
      statistics: mapMarketStatistics(latestStats),
      roi: mapRoi(latestStats),
    },
  };
}

export function mapPropertyToAggregate(
  record: PropertyWithRelations,
  options?: PropertyLoadOptions
): PropertyAggregate {
  const sections = resolveLoadSections(options);
  const core = mapCore(record);
  const listings = record.listings ?? [];
  const current = getCurrentListing(listings);
  const previous = listings.filter((l) => l.id !== current?.id);

  const latestStats = record.marketStatistics?.[0] ?? null;

  return {
    ...core,
    owner: record.owner
      ? {
          id: record.owner.id,
          fullName: record.owner.fullName,
          email: record.owner.email,
          phone: record.owner.phone,
        }
      : null,
    agentAssignment: mapAgentAssignment(current),
    currentListing: current ? mapListingRecord(current) : null,
    previousListings: previous.map(mapListingRecord),
    priceHistory: (record.priceHistory ?? []).map((ph) => ({
      id: ph.id,
      listingId: ph.listingId,
      price: decimalToNumber(ph.price) ?? 0,
      currency: ph.currency,
      source: ph.source,
      recordedAt: ph.recordedAt,
    })),
    rentalHistory: [],
    saleHistory: [],
    media: { photos: [], videos: [], floorPlans: [] },
    amenities: [],
    maintenance: [],
    documents: [],
    workflow: {
      viewings: (record.viewings ?? []).map((v) => ({
        id: v.id,
        listingId: v.listingId,
        agentId: v.agentId,
        buyerId: v.buyerId,
        tenantId: v.tenantId,
        scheduledAt: v.scheduledAt,
        durationMinutes: v.durationMinutes,
        status: v.status,
        notes: v.notes,
      })),
      offers: (record.offers ?? []).map((o) => ({
        id: o.id,
        listingId: o.listingId,
        buyerId: o.buyerId,
        agentId: o.agentId,
        status: mapOfferStatusToDealStatus(o.status),
        offerPrice: decimalToNumber(o.offerPrice),
        agreedPrice: null,
        currency: o.currency,
        openedAt: o.submittedAt,
        closedAt: o.respondedAt,
      })),
      tasks: (record.tasks ?? []).map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        assigneeUserId: t.assigneeUserId,
        assigneeAgentId: t.assigneeAgentId,
        dueAt: t.dueAt,
        completedAt: t.completedAt,
        priority: t.priority.toLowerCase() as "low" | "medium" | "high",
        status: t.status.toLowerCase() as "pending" | "completed" | "cancelled",
      })),
      notes: [],
    },
    market: {
      statistics: mapMarketStatistics(latestStats),
      comparables: (record.subjectComparables ?? []).map((c) => ({
        id: c.id,
        comparablePropertyId: c.compPropertyId,
        propertyCode: c.compProperty.propertyCode,
        buildingName: c.compProperty.building.name,
        size: decimalToNumber(c.compProperty.areaSqft),
        price: decimalToNumber(
          c.compListing?.askingPrice ??
            c.compProperty.listings?.[0]?.askingPrice ??
            null
        ),
        pricePerSqft: decimalToNumber(
          c.compListing?.pricePerSqft ??
            c.compProperty.listings?.[0]?.pricePerSqft ??
            null
        ),
        differencePercent: decimalToNumber(c.priceDifferencePct),
        similarityScore: decimalToNumber(c.similarityScore) ?? 0,
        status:
          c.compListing?.status ??
          c.compProperty.listings?.[0]?.status ??
          null,
      })),
      roi: mapRoi(latestStats),
      holidayHome: null,
    },
    version: record.version,
    loadedSections: sections as PropertyAggregateSection[],
  };
}

/** Map OfferStatus to DealStatus for domain workflow compatibility. */
function mapOfferStatusToDealStatus(
  status: Offer["status"]
): Deal["status"] {
  switch (status) {
    case "ACCEPTED":
      return "UNDER_CONTRACT";
    case "REJECTED":
    case "WITHDRAWN":
    case "EXPIRED":
      return "CANCELLED";
    case "COUNTERED":
      return "NEGOTIATION";
    default:
      return "OFFER";
  }
}

export type { PropertyWithRelations };
