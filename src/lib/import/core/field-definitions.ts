import { PF_EXPERT_COLUMNS } from "../sources/pf-expert/pf-expert.columns";

/** Database fields the user can map CSV columns onto. */
export const IMPORT_FIELD_KEYS = [
  "propertyCode",
  "propertyType",
  "listingType",
  "askingPrice",
  "bedrooms",
  "bathrooms",
  "areaSqft",
  "location",
  "country",
  "emirate",
  "masterCommunity",
  "community",
  "building",
  "agentName",
  "listingStatus",
  "qualityScore",
  "currency",
  "pfExpertReference",
] as const;

export type ImportFieldKey = (typeof IMPORT_FIELD_KEYS)[number];

export type ImportFieldDefinition = {
  key: ImportFieldKey;
  label: string;
  description: string;
  required: boolean;
  aliases: readonly string[];
};

export const IMPORT_FIELD_DEFINITIONS: ImportFieldDefinition[] = [
  {
    key: "propertyCode",
    label: "Property Code",
    description: "Unique business key (e.g. PF Expert Reference)",
    required: true,
    aliases: PF_EXPERT_COLUMNS.reference,
  },
  {
    key: "propertyType",
    label: "Property Type",
    description: "Apartment, Villa, Townhouse, etc.",
    required: true,
    aliases: PF_EXPERT_COLUMNS.propertyType,
  },
  {
    key: "listingType",
    label: "Rent / Sale",
    description: "Listing purpose — rent or sale",
    required: true,
    aliases: PF_EXPERT_COLUMNS.rentSale,
  },
  {
    key: "askingPrice",
    label: "Asking Price",
    description: "Listed price in local currency",
    required: true,
    aliases: PF_EXPERT_COLUMNS.price,
  },
  {
    key: "bedrooms",
    label: "Bedrooms",
    description: "Number of bedrooms",
    required: false,
    aliases: PF_EXPERT_COLUMNS.bedrooms,
  },
  {
    key: "bathrooms",
    label: "Bathrooms",
    description: "Number of bathrooms",
    required: false,
    aliases: PF_EXPERT_COLUMNS.bathrooms,
  },
  {
    key: "areaSqft",
    label: "Area",
    description: "Internal area in square feet",
    required: false,
    aliases: PF_EXPERT_COLUMNS.size,
  },
  {
    key: "location",
    label: "Location",
    description: "Combined location string (parsed into hierarchy)",
    required: false,
    aliases: PF_EXPERT_COLUMNS.location,
  },
  {
    key: "country",
    label: "Country",
    description: "Country name",
    required: false,
    aliases: PF_EXPERT_COLUMNS.country,
  },
  {
    key: "emirate",
    label: "Emirate / City",
    description: "Emirate or city",
    required: false,
    aliases: PF_EXPERT_COLUMNS.emirate,
  },
  {
    key: "masterCommunity",
    label: "Master Community",
    description: "Master development name",
    required: false,
    aliases: PF_EXPERT_COLUMNS.masterCommunity,
  },
  {
    key: "community",
    label: "Community",
    description: "Sub-community or project name",
    required: false,
    aliases: PF_EXPERT_COLUMNS.community,
  },
  {
    key: "building",
    label: "Building",
    description: "Building, tower, or block name",
    required: false,
    aliases: PF_EXPERT_COLUMNS.building,
  },
  {
    key: "agentName",
    label: "Assigned Agent",
    description: "Listing agent name",
    required: false,
    aliases: PF_EXPERT_COLUMNS.agent,
  },
  {
    key: "listingStatus",
    label: "Listing Status",
    description: "Active, Draft, Sold, etc.",
    required: true,
    aliases: PF_EXPERT_COLUMNS.listingState,
  },
  {
    key: "qualityScore",
    label: "Quality Score",
    description: "Listing quality score (0–100)",
    required: false,
    aliases: PF_EXPERT_COLUMNS.qualityScore,
  },
  {
    key: "currency",
    label: "Currency",
    description: "ISO currency code (defaults to AED)",
    required: false,
    aliases: PF_EXPERT_COLUMNS.currency,
  },
  {
    key: "pfExpertReference",
    label: "PF Expert Reference",
    description: "External listing reference for upsert/sync",
    required: false,
    aliases: PF_EXPERT_COLUMNS.reference,
  },
];

export type ImportColumnMapping = Partial<Record<ImportFieldKey, string | null>>;
