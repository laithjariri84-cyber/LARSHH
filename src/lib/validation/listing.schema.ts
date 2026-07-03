import { z } from "zod";

import { ListingStatus, ListingType } from "@prisma/client";

import { currencySchema, uuidSchema } from "./common.schema";

export const createListingSchema = z.object({
  agentId: uuidSchema,
  marketingTitle: z.string().min(1).max(500),
  description: z.string().max(10000).nullable().optional(),
  askingPrice: z.number().positive(),
  currency: currencySchema.optional(),
  listingType: z.nativeEnum(ListingType),
  status: z.nativeEnum(ListingStatus).optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  pfExpertReference: z.string().max(200).nullable().optional(),
  salesforceId: z.string().max(200).nullable().optional(),
  qualityScore: z.number().min(0).max(100).nullable().optional(),
});

export const updateListingStatusSchema = z.object({
  status: z.nativeEnum(ListingStatus),
});

export type CreateListingDto = z.infer<typeof createListingSchema>;
