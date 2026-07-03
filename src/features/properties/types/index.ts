import type {

  Furnishing,

  ListingStatus,

  ListingType,

  PropertyType,

  ViewType,

} from "@prisma/client";

import type { PropertyMarketIntelligence } from "@/server/market-intelligence";



export type PropertyAgentInfo = {

  id: string;

  fullName: string;

  email: string | null;

  phone: string | null;

  agencyName: string | null;

  licenseNumber: string | null;

};



export type PropertyPhotoInfo = {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  isPrimary: boolean;
  storagePath?: string;
  displayOrder?: number;
  uploadedAt?: Date;
};



export type PropertyFloorPlanInfo = {

  id: string;

  url: string;

  title: string | null;

};



export type PropertyPricingInfo = {

  askingPrice: number | null;

  askingRent: number | null;

  askingSale: number | null;

  pricePerSqFt: number | null;

  lastUpdated: Date;

  currency: string;

};



export type PropertyInformationInfo = {

  view: ViewType | null;

  furnishing: Furnishing | null;

  floor: number | null;

  completionYear: number | null;

};



export type PropertyTimelineEvent = {

  id: string;

  type: "created" | "updated" | "price_changed" | "status_changed";

  label: string;

  description: string;

  occurredAt: Date;

};



export type PropertyInternalNote = {
  id: string;
  body: string;
  isPinned: boolean;
  authorName: string;
  createdAt: Date;
};

export type SimilarPropertySummary = {
  propertyId: string;
  community: string;
  building: string;
  unitNumber: string | null;
  propertyType: PropertyType;
  bedrooms: number | null;
  size: number | null;
  askingRent: number | null;
  askingSale: number | null;
  listingType: ListingType | null;
  status: ListingStatus | null;
  currency: string;
};



export type PropertyDetailsViewModel = {

  id: string;

  propertyCode: string;

  pfExpertReference: string | null;

  masterCommunity: string | null;

  community: string;

  building: string;

  unitNumber: string | null;

  propertyType: PropertyType;

  bedrooms: number | null;

  bathrooms: number | null;

  size: number | null;

  listingStatus: ListingStatus | null;

  listingType: ListingType | null;

  marketingTitle: string | null;

  description: string | null;

  createdAt: Date;

  updatedAt: Date;

  listingPublishedAt: Date | null;

  listingUpdatedAt: Date | null;

  pricing: PropertyPricingInfo;

  information: PropertyInformationInfo;

  agent: PropertyAgentInfo | null;

  photos: PropertyPhotoInfo[];

  floorPlans: PropertyFloorPlanInfo[];

  timeline: PropertyTimelineEvent[];

  similarProperties: SimilarPropertySummary[];

  marketIntelligence: PropertyMarketIntelligence | null;

  internalNotes: PropertyInternalNote[];

};


