import { z } from "zod";

import { DealStatus } from "@prisma/client";

import { currencySchema, uuidSchema } from "./common.schema";

export const createDealSchema = z.object({
  listingId: uuidSchema,
  buyerId: uuidSchema,
  agentId: uuidSchema,
  status: z.nativeEnum(DealStatus).optional(),
  offerPrice: z.number().positive().nullable().optional(),
  agreedPrice: z.number().positive().nullable().optional(),
  currency: currencySchema.optional(),
  openedAt: z.coerce.date().optional(),
});

export const updateDealSchema = z.object({
  status: z.nativeEnum(DealStatus).optional(),
  offerPrice: z.number().positive().nullable().optional(),
  agreedPrice: z.number().positive().nullable().optional(),
  closedAt: z.coerce.date().nullable().optional(),
});

export type CreateDealDto = z.infer<typeof createDealSchema>;
export type UpdateDealDto = z.infer<typeof updateDealSchema>;
