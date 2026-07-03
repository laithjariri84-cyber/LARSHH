import type {
  ListingStatus,
  ListingType,
  PropertyType,
} from "@prisma/client";

/** Supported external listing feeds — Salesforce reuses the same pipeline contract. */
export type ImportSourceId = "pf-expert" | "salesforce";

export type ParsedLocation = {
  country: string;
  emirate: string;
  masterCommunity: string;
  community: string;
  building: string;
};

/** Normalized row ready for validation and persistence. */
export type NormalizedImportRow = {
  rowNumber: number;
  propertyCode: string;
  listingStatus: ListingStatus;
  propertyType: PropertyType;
  listingType: ListingType;
  askingPrice: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqft: number | null;
  location: ParsedLocation;
  agentName: string;
  qualityScore: number | null;
  pfExpertReference: string | null;
  raw: Record<string, string>;
};

export type ImportRowIssue = {
  rowNumber: number;
  field?: string;
  message: string;
};

export type ImportPreviewRow = {
  rowNumber: number;
  propertyCode: string;
  listingType: ListingType;
  askingPrice: number;
  currency: string;
  locationLabel: string;
  agentName: string;
  qualityScore: number | null;
  normalized: NormalizedImportRow;
  warnings: string[];
};

export type ImportPreviewResult = {
  source: ImportSourceId;
  fileName: string;
  headers: string[];
  columnMapping: import("./field-definitions").ImportColumnMapping;
  totalRows: number;
  parsedRows: number;
  skippedInvalid: number;
  newListings: ImportPreviewRow[];
  duplicateListings: ImportPreviewRow[];
  duplicateInFile: ImportPreviewRow[];
  errors: ImportRowIssue[];
  warnings: ImportRowIssue[];
};

export type ImportHeadersResult = {
  headers: string[];
  suggestedMapping: import("./field-definitions").ImportColumnMapping;
};

export type ImportCommitResult = {
  imported: number;
  skipped: number;
  duplicates: number;
  errors: ImportRowIssue[];
  propertyIds: string[];
};

export type ImportCommitInput = {
  source: ImportSourceId;
  fileName: string;
  rows: NormalizedImportRow[];
};
