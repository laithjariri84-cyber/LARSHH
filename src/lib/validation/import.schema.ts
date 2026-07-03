import { z } from "zod";

import { ListingStatus, ListingType, PropertyType } from "@prisma/client";

const parsedLocationSchema = z.object({
  country: z.string(),
  emirate: z.string(),
  masterCommunity: z.string(),
  community: z.string(),
  building: z.string(),
});

export const normalizedImportRowSchema = z.object({
  rowNumber: z.number().int().positive(),
  propertyCode: z.string().min(1),
  listingStatus: z.nativeEnum(ListingStatus),
  propertyType: z.nativeEnum(PropertyType),
  listingType: z.nativeEnum(ListingType),
  askingPrice: z.number().positive(),
  currency: z.string().length(3),
  bedrooms: z.number().int().nullable(),
  bathrooms: z.number().nullable(),
  areaSqft: z.number().nullable(),
  location: parsedLocationSchema,
  agentName: z.string().min(1),
  qualityScore: z.number().min(0).max(100).nullable(),
  pfExpertReference: z.string().nullable(),
  raw: z.record(z.string()),
});

export const importCommitSchema = z.object({
  source: z.enum(["pf-expert", "salesforce"]),
  fileName: z.string().min(1),
  rows: z.array(normalizedImportRowSchema).min(1),
});

export type ImportCommitPayload = z.infer<typeof importCommitSchema>;
