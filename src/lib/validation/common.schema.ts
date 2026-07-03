import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const currencySchema = z.string().length(3).default("USD");

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
