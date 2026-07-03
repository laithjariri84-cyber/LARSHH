import { z } from "zod";

import { currencySchema, uuidSchema } from "./common.schema";

export const createPriceHistorySchema = z.object({
  listingId: uuidSchema.nullable().optional(),
  price: z.number().positive(),
  currency: currencySchema.optional(),
  source: z.string().max(50).default("manual"),
  recordedAt: z.coerce.date(),
});

export type CreatePriceHistoryDto = z.infer<typeof createPriceHistorySchema>;
