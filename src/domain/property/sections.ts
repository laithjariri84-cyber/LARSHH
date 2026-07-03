/**
 * Property aggregate section identifiers.
 *
 * Decision: At 100k+ properties, loading the full aggregate on every request
 * is prohibitively expensive. Sections enable partial hydration — Search loads
 * SUMMARY + CURRENT_LISTING; Intelligence loads MARKET + COMPARABLES; Detail
 * loads everything except MAINTENANCE unless requested.
 */
export const PROPERTY_AGGREGATE_SECTIONS = [
  "identity",
  "location",
  "community",
  "building",
  "owner",
  "specification",
  "current_listing",
  "previous_listings",
  "price_history",
  "rental_history",
  "sale_history",
  "photos",
  "videos",
  "floor_plans",
  "amenities",
  "maintenance",
  "documents",
  "viewings",
  "offers",
  "tasks",
  "notes",
  "agent_assignment",
  "market_statistics",
  "comparables",
  "holiday_home",
  "roi",
] as const;

export type PropertyAggregateSection =
  (typeof PROPERTY_AGGREGATE_SECTIONS)[number];

/** Preset load profiles for common use cases. */
export const PROPERTY_LOAD_PROFILES = {
  /** Search results row — minimal payload */
  summary: [
    "identity",
    "location",
    "community",
    "building",
    "specification",
    "current_listing",
    "agent_assignment",
    "market_statistics",
  ] satisfies PropertyAggregateSection[],

  /** Property detail page */
  detail: [
    "identity",
    "location",
    "community",
    "building",
    "owner",
    "specification",
    "current_listing",
    "previous_listings",
    "price_history",
    "photos",
    "videos",
    "floor_plans",
    "amenities",
    "documents",
    "viewings",
    "offers",
    "tasks",
    "notes",
    "agent_assignment",
    "comparables",
    "holiday_home",
    "roi",
  ] satisfies PropertyAggregateSection[],

  /** Market / property intelligence */
  intelligence: [
    "identity",
    "location",
    "community",
    "building",
    "specification",
    "current_listing",
    "price_history",
    "rental_history",
    "sale_history",
    "market_statistics",
    "comparables",
    "holiday_home",
    "roi",
  ] satisfies PropertyAggregateSection[],

  /** Full aggregate — admin, export, audit */
  full: PROPERTY_AGGREGATE_SECTIONS,
} as const;

export type PropertyLoadProfile = keyof typeof PROPERTY_LOAD_PROFILES;

export type PropertyLoadOptions = {
  /** Explicit section list — overrides profile */
  sections?: PropertyAggregateSection[];
  /** Named preset — ignored if sections provided */
  profile?: PropertyLoadProfile;
  /** Include soft-deleted child records */
  includeDeleted?: boolean;
  /** Max items per collection section (pagination within aggregate) */
  collectionLimits?: Partial<Record<PropertyAggregateSection, number>>;
};

export function resolveLoadSections(
  options?: PropertyLoadOptions
): PropertyAggregateSection[] {
  if (options?.sections?.length) return options.sections;
  if (options?.profile) return [...PROPERTY_LOAD_PROFILES[options.profile]];
  return [...PROPERTY_LOAD_PROFILES.summary];
}
