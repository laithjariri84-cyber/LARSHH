import type { ListingStatus, ListingType } from "@prisma/client";

/** A market offer attached to the property. */
export type PropertyListingRecord = {
  id: string;
  marketingTitle: string;
  description: string | null;
  askingPrice: number;
  currency: string;
  listingType: ListingType;
  status: ListingStatus;
  agentId: string;
  publishedAt: Date | null;
  expiresAt: Date | null;
  pfExpertReference: string | null;
  salesforceId: string | null;
  qualityScore: number | null;
  soldAt: Date | null;
  daysOnMarket: number | null;
  pricePerSqft: number | null;
  marketDifferencePercent: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PriceHistoryRecord = {
  id: string;
  listingId: string | null;
  price: number;
  currency: string;
  source: string;
  recordedAt: Date;
};

export type RentalHistoryRecord = {
  id: string;
  listingId: string | null;
  tenantId: string | null;
  annualRent: number;
  currency: string;
  leaseStart: Date | null;
  leaseEnd: Date | null;
  recordedAt: Date;
};

export type SaleHistoryRecord = {
  id: string;
  listingId: string | null;
  buyerId: string | null;
  salePrice: number;
  currency: string;
  closedAt: Date;
};
