import type { Furnishing, PropertyType, ViewType } from "@prisma/client";

import type { PropertyAggregateSection } from "./sections";

/** Input to create a new Property aggregate (minimum viable property). */
export type CreatePropertyAggregateInput = {
  propertyCode: string;
  buildingId: string;
  ownerId?: string | null;
  unitNumber?: string | null;
  floor?: number | null;
  areaSqft?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  propertyType: PropertyType;
  furnishing?: Furnishing | null;
  view?: ViewType | null;
  latitude?: number | null;
  longitude?: number | null;
};

/** Partial update to aggregate core (not child collections). */
export type UpdatePropertyCoreInput = {
  unitNumber?: string | null;
  floor?: number | null;
  areaSqft?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  propertyType?: PropertyType;
  furnishing?: Furnishing | null;
  view?: ViewType | null;
  latitude?: number | null;
  longitude?: number | null;
  ownerId?: string | null;
  version: number;
};

/** Append operations for child collections — used without full aggregate reload. */
export type AppendPropertyChildInput =
  | { section: "price_history"; data: Omit<import("./listings-history").PriceHistoryRecord, "id"> }
  | { section: "notes"; data: Omit<import("./workflow").PropertyNoteRecord, "id" | "createdAt" | "updatedAt"> }
  | { section: "photos"; data: Omit<import("./media-assets").PropertyPhoto, "id"> };

export type PropertyAggregatePatch = {
  core?: UpdatePropertyCoreInput;
  append?: AppendPropertyChildInput[];
  sectionsToReload?: PropertyAggregateSection[];
};
