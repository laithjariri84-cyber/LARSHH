import { z } from "zod";
import {
  Furnishing,
  ListingStatus,
  ListingType,
  PropertyType,
  ViewType,
} from "@prisma/client";

const optionalEnum = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    schema.optional()
  );

const optionalNumber = z.preprocess((val) => {
  if (val === "" || val === undefined || val === null) return undefined;
  const num = Number(val);
  return Number.isNaN(num) ? undefined : num;
}, z.number().optional());

export const searchFiltersSchema = z.object({
  communityId: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  buildingId: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  propertyType: optionalEnum(z.nativeEnum(PropertyType)),
  listingType: optionalEnum(z.nativeEnum(ListingType)),
  bedrooms: optionalNumber,
  bathrooms: optionalNumber,
  furnishing: optionalEnum(z.nativeEnum(Furnishing)),
  view: optionalEnum(z.nativeEnum(ViewType)),
  status: optionalEnum(z.nativeEnum(ListingStatus)),
  minPrice: optionalNumber,
  maxPrice: optionalNumber,
  minSize: optionalNumber,
  maxSize: optionalNumber,
  minPricePerSqft: optionalNumber,
  maxPricePerSqft: optionalNumber,
  minRoi: optionalNumber,
});

export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>;

export const searchFiltersDefaults: SearchFiltersInput = {};

/** Safe parser for URL search params — never throws on malformed input. */
export function parseSearchFilters(
  raw: Record<string, string | undefined>
): SearchFiltersInput {
  const result = searchFiltersSchema.safeParse(raw);
  return result.success ? result.data : searchFiltersDefaults;
}
