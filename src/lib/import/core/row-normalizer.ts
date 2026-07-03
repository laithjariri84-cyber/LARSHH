import { listingStatusParser } from "@/lib/import/parsers/listing-status.parser";
import { locationParser } from "@/lib/import/parsers/location.parser";
import { numericParser } from "@/lib/import/parsers/numeric.parser";
import { priceParser } from "@/lib/import/parsers/price.parser";
import { propertyTypeParser } from "@/lib/import/parsers/property-type.parser";
import { listingTypeParser } from "@/lib/import/parsers/purpose.parser";
import { qualityScoreParser } from "@/lib/import/parsers/quality-score.parser";

import { getMappedCell } from "./column-mapping";
import type { ImportColumnMapping } from "./field-definitions";
import type { RawImportRow } from "./import-pipeline.interface";
import type { ImportRowIssue, NormalizedImportRow } from "./types";

export function normalizeImportRow(
  row: RawImportRow,
  rowNumber: number,
  mapping: ImportColumnMapping
): {
  normalized: NormalizedImportRow | null;
  errors: ImportRowIssue[];
  warnings: ImportRowIssue[];
} {
  const errors: ImportRowIssue[] = [];
  const warnings: ImportRowIssue[] = [];

  const reference =
    getMappedCell(row, mapping, "pfExpertReference").trim() ||
    getMappedCell(row, mapping, "propertyCode").trim();

  if (!reference) {
    errors.push({
      rowNumber,
      field: "Property Code",
      message: "Property code / reference is required",
    });
    return { normalized: null, errors, warnings };
  }

  const listingStateRaw = getMappedCell(row, mapping, "listingStatus");
  const listingStateResult = listingStatusParser.parse(listingStateRaw);
  if (!listingStateResult.status) {
    errors.push({
      rowNumber,
      field: "Listing Status",
      message: listingStateResult.error ?? "Invalid listing status",
    });
  }

  const propertyTypeRaw = getMappedCell(row, mapping, "propertyType");
  const propertyTypeResult = propertyTypeParser.parse(propertyTypeRaw);
  if (!propertyTypeResult.propertyType) {
    errors.push({
      rowNumber,
      field: "Property Type",
      message: propertyTypeResult.error ?? "Invalid property type",
    });
  }

  const rentSaleRaw = getMappedCell(row, mapping, "listingType");
  const listingTypeResult = listingTypeParser.parse(rentSaleRaw);
  if (!listingTypeResult.listingType) {
    errors.push({
      rowNumber,
      field: "Rent / Sale",
      message: listingTypeResult.error ?? "Invalid listing type",
    });
  }

  const priceRaw = getMappedCell(row, mapping, "askingPrice");
  const priceResult = priceParser.parse(priceRaw);
  if (priceResult.price === null) {
    errors.push({
      rowNumber,
      field: "Asking Price",
      message: priceResult.error ?? "Invalid price",
    });
  }

  const bedroomsRaw = getMappedCell(row, mapping, "bedrooms");
  if (bedroomsRaw.trim()) {
    const bedrooms = numericParser.parseOptionalInt(bedroomsRaw);
    if (bedrooms === null) {
      errors.push({
        rowNumber,
        field: "Bedrooms",
        message: "Invalid bedroom count",
      });
    }
  }

  const bathroomsRaw = getMappedCell(row, mapping, "bathrooms");
  if (bathroomsRaw.trim()) {
    const bathrooms = numericParser.parseOptionalDecimal(bathroomsRaw);
    if (bathrooms === null) {
      errors.push({
        rowNumber,
        field: "Bathrooms",
        message: "Invalid bathroom count",
      });
    }
  }

  const areaRaw = getMappedCell(row, mapping, "areaSqft");
  if (areaRaw.trim()) {
    const area = numericParser.parseOptionalDecimal(areaRaw);
    if (area === null) {
      errors.push({
        rowNumber,
        field: "Area",
        message: "Invalid area value",
      });
    }
  }

  const qualityRaw = getMappedCell(row, mapping, "qualityScore");
  const qualityResult = qualityScoreParser.parse(qualityRaw);
  if (qualityResult.warning) {
    warnings.push({
      rowNumber,
      field: "Quality Score",
      message: qualityResult.warning,
    });
  }

  const locationResult = locationParser.parse({
    location: getMappedCell(row, mapping, "location"),
    country: getMappedCell(row, mapping, "country"),
    emirate: getMappedCell(row, mapping, "emirate"),
    masterCommunity: getMappedCell(row, mapping, "masterCommunity"),
    community: getMappedCell(row, mapping, "community"),
    building: getMappedCell(row, mapping, "building"),
  });

  for (const msg of locationResult.warnings) {
    warnings.push({ rowNumber, field: "Location", message: msg });
  }

  const agentName = getMappedCell(row, mapping, "agentName").trim();
  if (!agentName) {
    warnings.push({
      rowNumber,
      field: "Assigned Agent",
      message: "Agent missing — import agent will be assigned",
    });
  }

  const currency = getMappedCell(row, mapping, "currency").trim() || "AED";

  if (errors.length > 0) {
    return { normalized: null, errors, warnings };
  }

  return {
    normalized: {
      rowNumber,
      propertyCode: reference,
      listingStatus: listingStateResult.status!,
      propertyType: propertyTypeResult.propertyType!,
      listingType: listingTypeResult.listingType!,
      askingPrice: priceResult.price!,
      currency,
      bedrooms: numericParser.parseOptionalInt(bedroomsRaw),
      bathrooms: numericParser.parseOptionalDecimal(bathroomsRaw),
      areaSqft: numericParser.parseOptionalDecimal(areaRaw),
      location: {
        country: locationResult.country,
        emirate: locationResult.emirate,
        masterCommunity: locationResult.masterCommunity,
        community: locationResult.community,
        building: locationResult.building,
      },
      agentName: agentName || "Import Agent",
      qualityScore: qualityResult.score,
      pfExpertReference: reference,
      raw: row,
    },
    errors,
    warnings,
  };
}
