import { z } from "zod";

export const smartSearchSortSchema = z.enum([
  "newest",
  "oldest",
  "price_sqft_asc",
  "price_sqft_desc",
  "price_asc",
  "price_desc",
  "roi_desc",
  "best_value",
  "relevance",
  "luxury",
]);

export type SmartSearchSort = z.infer<typeof smartSearchSortSchema>;

export const smartSearchMetaSchema = z.object({
  sort: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    smartSearchSortSchema.optional()
  ),
  smartQuery: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    z.string().max(500).optional()
  ),
  detected: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    z.string().optional()
  ),
});

export type SmartSearchMeta = z.infer<typeof smartSearchMetaSchema>;

const smartSearchMetaDefaults: SmartSearchMeta = {};

export function parseSmartSearchMeta(
  params: Record<string, string | string[] | undefined>
) {
  const pick = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const result = smartSearchMetaSchema.safeParse({
    sort: pick("sort"),
    smartQuery: pick("smartQuery"),
    detected: pick("detected"),
  });

  return result.success ? result.data : smartSearchMetaDefaults;
}

export function parseDetectedKeys(detected?: string): string[] {
  if (!detected) return [];
  return detected.split(",").map((k) => k.trim()).filter(Boolean);
}
