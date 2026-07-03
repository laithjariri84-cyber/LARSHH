import { normalizeHeader } from "./csv-parser";
import {
  IMPORT_FIELD_DEFINITIONS,
  type ImportColumnMapping,
  type ImportFieldKey,
} from "./field-definitions";
import type { RawImportRow } from "./import-pipeline.interface";

/** Auto-suggest CSV column mapping from detected headers. */
export function suggestColumnMapping(headers: string[]): ImportColumnMapping {
  const mapping: ImportColumnMapping = {};

  for (const field of IMPORT_FIELD_DEFINITIONS) {
    const match = headers.find((header) =>
      field.aliases.some((alias) => normalizeHeader(alias) === header)
    );
    if (match) {
      mapping[field.key] = match;
    }
  }

  return mapping;
}

/** Read a cell value using the user's column mapping. */
export function getMappedCell(
  row: RawImportRow,
  mapping: ImportColumnMapping,
  field: ImportFieldKey
): string {
  const mappedHeader = mapping[field];
  if (mappedHeader && row[mappedHeader] !== undefined) {
    return row[mappedHeader] ?? "";
  }
  return "";
}

/** Validate that all required fields have a mapped CSV column. */
export function validateColumnMapping(mapping: ImportColumnMapping): string[] {
  const missing: string[] = [];

  for (const field of IMPORT_FIELD_DEFINITIONS) {
    if (field.required && !mapping[field.key]) {
      missing.push(field.label);
    }
  }

  return missing;
}
