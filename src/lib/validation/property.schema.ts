import { z } from "zod";

import { Furnishing, PropertyType, ViewType } from "@prisma/client";

import { paginationQuerySchema, uuidSchema } from "./common.schema";

export const createPropertySchema = z.object({
  propertyCode: z.string().min(2).max(50),
  buildingId: uuidSchema,
  ownerId: uuidSchema.nullable().optional(),
  unitNumber: z.string().max(50).nullable().optional(),
  floor: z.number().int().nullable().optional(),
  areaSqft: z.number().positive().nullable().optional(),
  bedrooms: z.number().int().min(0).nullable().optional(),
  bathrooms: z.number().min(0).nullable().optional(),
  propertyType: z.nativeEnum(PropertyType),
  furnishing: z.nativeEnum(Furnishing).nullable().optional(),
  view: z.nativeEnum(ViewType).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});

export const updatePropertyCoreSchema = z.object({
  unitNumber: z.string().max(50).nullable().optional(),
  floor: z.number().int().nullable().optional(),
  areaSqft: z.number().positive().nullable().optional(),
  bedrooms: z.number().int().min(0).nullable().optional(),
  bathrooms: z.number().min(0).nullable().optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  furnishing: z.nativeEnum(Furnishing).nullable().optional(),
  view: z.nativeEnum(ViewType).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  ownerId: uuidSchema.nullable().optional(),
  version: z.number().int().min(1),
});

export const propertySearchQuerySchema = paginationQuerySchema.extend({
  q: z.string().optional(),
  communityId: uuidSchema.optional(),
  buildingId: uuidSchema.optional(),
  ownerId: uuidSchema.optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  furnishing: z.nativeEnum(Furnishing).optional(),
  view: z.nativeEnum(ViewType).optional(),
  bedrooms: z.coerce.number().int().optional(),
  minBedrooms: z.coerce.number().int().optional(),
  maxBedrooms: z.coerce.number().int().optional(),
  bathrooms: z.coerce.number().optional(),
  minAreaSqft: z.coerce.number().optional(),
  maxAreaSqft: z.coerce.number().optional(),
  profile: z.enum(["summary", "detail", "intelligence", "full"]).optional(),
});

export const propertyIdParamSchema = z.object({
  id: uuidSchema,
});

export type CreatePropertyDto = z.infer<typeof createPropertySchema>;
export type UpdatePropertyCoreDto = z.infer<typeof updatePropertyCoreSchema>;
export type PropertySearchQueryDto = z.infer<typeof propertySearchQuerySchema>;
