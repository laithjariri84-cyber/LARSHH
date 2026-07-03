import { CsvParser } from "@/lib/import/core/csv-parser";
import { suggestColumnMapping } from "@/lib/import/core/column-mapping";
import type { ImportColumnMapping } from "@/lib/import/core/field-definitions";
import { normalizeImportRow } from "@/lib/import/core/row-normalizer";
import type { IImportSourceParser, RawImportRow } from "@/lib/import/core/import-pipeline.interface";
import type { ImportRowIssue, NormalizedImportRow } from "@/lib/import/core/types";

export class PfExpertParser implements IImportSourceParser {
  readonly sourceId = "pf-expert" as const;
  private readonly csv = new CsvParser();
  private columnMapping: ImportColumnMapping | null = null;

  setColumnMapping(mapping: ImportColumnMapping) {
    this.columnMapping = mapping;
  }

  parseCsv(csvText: string, _fileName?: string) {
    const parsed = this.csv.parse(csvText);
    if (!this.columnMapping) {
      this.columnMapping = suggestColumnMapping(parsed.headers);
    }
    return parsed;
  }

  getSuggestedMapping(headers: string[]) {
    return suggestColumnMapping(headers);
  }

  normalizeRow(
    row: RawImportRow,
    rowNumber: number
  ): {
    normalized: NormalizedImportRow | null;
    errors: ImportRowIssue[];
    warnings: ImportRowIssue[];
  } {
    const mapping = this.columnMapping ?? {};
    return normalizeImportRow(row, rowNumber, mapping);
  }
}

export const pfExpertParser = new PfExpertParser();
