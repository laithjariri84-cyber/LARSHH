import { z } from "zod";

import { OfferStatus } from "@prisma/client";

import { currencySchema, uuidSchema } from "./common.schema";

export const createOfferSchema = z.object({
  listingId: uuidSchema,
  buyerId: uuidSchema,
  agentId: uuidSchema,
  offerPrice: z.number().positive(),
  currency: currencySchema.optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export const updateOfferStatusSchema = z.object({
  status: z.nativeEnum(OfferStatus),
});

export type CreateOfferDto = z.infer<typeof createOfferSchema>;
