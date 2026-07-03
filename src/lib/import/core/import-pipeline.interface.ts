import type { ImportSourceId } from "./types";

/** Raw CSV row keyed by normalized header names. */
export type RawImportRow = Record<string, string>;

export type CsvParseResult = {
  headers: string[];
  rows: RawImportRow[];
};

/**
 * Source-specific parser — maps vendor CSV/JSON into normalized rows.
 * Salesforce will implement the same interface.
 */
export interface IImportSourceParser {
  readonly sourceId: ImportSourceId;
  parseCsv(csvText: string, fileName?: string): CsvParseResult;
  normalizeRow(row: RawImportRow, rowNumber: number): {
    normalized: import("./types").NormalizedImportRow | null;
    errors: import("./types").ImportRowIssue[];
    warnings: import("./types").ImportRowIssue[];
  };
}
