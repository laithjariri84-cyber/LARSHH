import { z } from "zod";

import { ViewingStatus } from "@prisma/client";

import { uuidSchema } from "./common.schema";

export const createViewingSchema = z.object({
  listingId: uuidSchema,
  agentId: uuidSchema,
  buyerId: uuidSchema.nullable().optional(),
  tenantId: uuidSchema.nullable().optional(),
  scheduledAt: z.coerce.date(),
  durationMinutes: z.number().int().min(15).max(480).optional(),
  status: z.nativeEnum(ViewingStatus).optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export const updateViewingStatusSchema = z.object({
  status: z.nativeEnum(ViewingStatus),
});

export type CreateViewingDto = z.infer<typeof createViewingSchema>;
