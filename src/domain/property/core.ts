import type { Furnishing, PropertyType, ViewType } from "@prisma/client";

/** Business identity — stable keys used across search, reports, and integrations. */
export type PropertyIdentity = {
  id: string;
  propertyCode: string;
  unitNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

/** Physical placement within the portfolio hierarchy. */
export type PropertyLocation = {
  buildingId: string;
  communityId: string;
  masterCommunityName: string | null;
  floor: number | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
};

/** Read-only community projection embedded in the aggregate. */
export type PropertyCommunity = {
  id: string;
  name: string;
  slug: string;
  masterName: string | null;
  description: string | null;
};

/** Read-only building projection embedded in the aggregate. */
export type PropertyBuilding = {
  id: string;
  name: string;
  code: string | null;
  totalFloors: number | null;
  yearBuilt: number | null;
};

/** Owner reference — PII fields gated at service layer by permission. */
export type PropertyOwner = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
};

/** Permanent physical product specification. */
export type PropertySpecification = {
  areaSqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  propertyType: PropertyType;
  furnishing: Furnishing | null;
  view: ViewType | null;
};

/** Assigned listing agent for the active market offer. */
export type PropertyAgentAssignment = {
  agentId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  licenseNumber: string | null;
  assignedAt: Date;
};
