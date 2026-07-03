import type { OfferStatus, DealStatus, PrismaClient, ViewingStatus, ListingStatus } from "@prisma/client";

import type {
  PropertyListingRecord,
  PropertyOfferRecord,
  PropertyViewingRecord,
} from "@/domain/property";
import type {
  IPropertyListingRepository,
  IPropertyOfferRepository,
  IPropertyViewingRepository,
} from "@/repositories/property/child-repositories";

import { decimalToNumber } from "../utils/decimal";

function mapListing(listing: {
  id: string;
  marketingTitle: string;
  description: string | null;
  askingPrice: { toNumber(): number };
  currency: string;
  listingType: PropertyListingRecord["listingType"];
  status: PropertyListingRecord["status"];
  agentId: string;
  publishedAt: Date | null;
  expiresAt: Date | null;
  pfExpertReference: string | null;
  salesforceId: string | null;
  qualityScore: { toNumber(): number } | null;
  soldAt: Date | null;
  daysOnMarket: number | null;
  pricePerSqft: { toNumber(): number } | null;
  marketDifferencePercent: { toNumber(): number } | null;
  createdAt: Date;
  updatedAt: Date;
}): PropertyListingRecord {
  return {
    id: listing.id,
    marketingTitle: listing.marketingTitle,
    description: listing.description,
    askingPrice: decimalToNumber(listing.askingPrice as never) ?? 0,
    currency: listing.currency,
    listingType: listing.listingType,
    status: listing.status,
    agentId: listing.agentId,
    publishedAt: listing.publishedAt,
    expiresAt: listing.expiresAt,
    pfExpertReference: listing.pfExpertReference,
    salesforceId: listing.salesforceId,
    qualityScore: decimalToNumber(listing.qualityScore as never),
    soldAt: listing.soldAt,
    daysOnMarket: listing.daysOnMarket,
    pricePerSqft: decimalToNumber(listing.pricePerSqft as never),
    marketDifferencePercent: decimalToNumber(
      listing.marketDifferencePercent as never
    ),
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

export class PrismaPropertyListingRepository implements IPropertyListingRepository {
  constructor(private readonly db: PrismaClient) {}

  async getCurrent(propertyId: string) {
    const listing = await this.db.listing.findFirst({
      where: {
        propertyId,
        deletedAt: null,
        status: { in: ["ACTIVE", "PENDING"] },
      },
      orderBy: { updatedAt: "desc" },
    });
    return listing ? mapListing(listing) : null;
  }

  async getPrevious(propertyId: string, limit = 20) {
    const current = await this.getCurrent(propertyId);
    const rows = await this.db.listing.findMany({
      where: {
        propertyId,
        deletedAt: null,
        ...(current ? { id: { not: current.id } } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
    return rows.map(mapListing);
  }

  async create(
    propertyId: string,
    input: Omit<PropertyListingRecord, "id" | "createdAt" | "updatedAt">
  ) {
    const row = await this.db.listing.create({
      data: {
        propertyId,
        agentId: input.agentId,
        marketingTitle: input.marketingTitle,
        description: input.description,
        askingPrice: input.askingPrice,
        currency: input.currency,
        listingType: input.listingType,
        status: input.status,
        publishedAt: input.publishedAt,
        expiresAt: input.expiresAt,
        pfExpertReference: input.pfExpertReference,
        salesforceId: input.salesforceId,
        qualityScore: input.qualityScore,
        soldAt: input.soldAt,
        daysOnMarket: input.daysOnMarket,
        pricePerSqft: input.pricePerSqft,
        marketDifferencePercent: input.marketDifferencePercent,
      },
    });
    return mapListing(row);
  }

  async updateStatus(propertyId: string, listingId: string, status: ListingStatus) {
    const row = await this.db.listing.update({
      where: { id: listingId, propertyId },
      data: { status },
    });
    return mapListing(row);
  }
}

export class PrismaPropertyOfferRepository implements IPropertyOfferRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByProperty(propertyId: string, limit = 50): Promise<PropertyOfferRecord[]> {
    const rows = await this.db.offer.findMany({
      where: { propertyId },
      orderBy: { submittedAt: "desc" },
      take: limit,
    });
    return rows.map(mapOfferRow);
  }

  async create(
    propertyId: string,
    input: Omit<PropertyOfferRecord, "id">
  ): Promise<PropertyOfferRecord> {
    const row = await this.db.offer.create({
      data: {
        propertyId,
        listingId: input.listingId,
        buyerId: input.buyerId,
        agentId: input.agentId,
        offerPrice: input.offerPrice ?? 0,
        currency: input.currency,
      },
    });
    return mapOfferRow(row);
  }

  async advanceStatus(
    propertyId: string,
    offerId: string,
    status: DealStatus
  ): Promise<PropertyOfferRecord> {
    const offerStatus = mapDealStatusToOfferStatus(status);
    const row = await this.db.offer.update({
      where: { id: offerId, propertyId },
      data: { status: offerStatus, respondedAt: new Date() },
    });
    return mapOfferRow(row);
  }
}

function mapOfferRow(o: {
  id: string;
  listingId: string;
  buyerId: string;
  agentId: string;
  status: OfferStatus;
  offerPrice: { toNumber(): number };
  currency: string;
  submittedAt: Date;
  respondedAt: Date | null;
}): PropertyOfferRecord {
  return {
    id: o.id,
    listingId: o.listingId,
    buyerId: o.buyerId,
    agentId: o.agentId,
    status: mapOfferStatusToDealStatus(o.status),
    offerPrice: decimalToNumber(o.offerPrice as never),
    agreedPrice: null,
    currency: o.currency,
    openedAt: o.submittedAt,
    closedAt: o.respondedAt,
  };
}

function mapDealStatusToOfferStatus(status: DealStatus): OfferStatus {
  switch (status) {
    case "UNDER_CONTRACT":
      return "ACCEPTED";
    case "CANCELLED":
      return "REJECTED";
    case "NEGOTIATION":
      return "COUNTERED";
    default:
      return "PENDING";
  }
}

export class PrismaPropertyViewingRepository
  implements IPropertyViewingRepository
{
  constructor(private readonly db: PrismaClient) {}

  async findByProperty(
    propertyId: string,
    limit = 50
  ): Promise<PropertyViewingRecord[]> {
    const rows = await this.db.viewing.findMany({
      where: { propertyId },
      orderBy: { scheduledAt: "desc" },
      take: limit,
    });
    return rows.map(mapViewingRow);
  }

  async findUpcoming(propertyId?: string): Promise<PropertyViewingRecord[]> {
    const rows = await this.db.viewing.findMany({
      where: {
        ...(propertyId ? { propertyId } : {}),
        scheduledAt: { gte: new Date() },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
      orderBy: { scheduledAt: "asc" },
      take: 50,
    });
    return rows.map(mapViewingRow);
  }

  async create(
    propertyId: string,
    input: Omit<PropertyViewingRecord, "id">
  ): Promise<PropertyViewingRecord> {
    const row = await this.db.viewing.create({
      data: {
        propertyId,
        listingId: input.listingId,
        agentId: input.agentId,
        buyerId: input.buyerId,
        tenantId: input.tenantId,
        scheduledAt: input.scheduledAt,
        durationMinutes: input.durationMinutes,
        status: input.status,
        notes: input.notes,
      },
    });
    return mapViewingRow(row);
  }

  async updateStatus(
    propertyId: string,
    viewingId: string,
    status: ViewingStatus
  ): Promise<PropertyViewingRecord> {
    const row = await this.db.viewing.update({
      where: { id: viewingId, propertyId },
      data: { status },
    });
    return mapViewingRow(row);
  }
}

function mapViewingRow(v: {
  id: string;
  listingId: string;
  agentId: string;
  buyerId: string | null;
  tenantId: string | null;
  scheduledAt: Date;
  durationMinutes: number;
  status: ViewingStatus;
  notes: string | null;
}): PropertyViewingRecord {
  return {
    id: v.id,
    listingId: v.listingId,
    agentId: v.agentId,
    buyerId: v.buyerId,
    tenantId: v.tenantId,
    scheduledAt: v.scheduledAt,
    durationMinutes: v.durationMinutes,
    status: v.status,
    notes: v.notes,
  };
}

function mapOfferStatusToDealStatus(status: OfferStatus): DealStatus {
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

export function createPropertyChildRepositories(db: PrismaClient) {
  return {
    listings: new PrismaPropertyListingRepository(db),
    offers: new PrismaPropertyOfferRepository(db),
    viewings: new PrismaPropertyViewingRepository(db),
  };
}
