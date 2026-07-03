import { CsvParser } from "@/lib/import/core/csv-parser";
import {
  suggestColumnMapping,
  validateColumnMapping,
} from "@/lib/import/core/column-mapping";
import type { ImportColumnMapping } from "@/lib/import/core/field-definitions";
import type { IImportSourceParser } from "@/lib/import/core/import-pipeline.interface";
import type {
  ImportCommitInput,
  ImportCommitResult,
  ImportHeadersResult,
  ImportPreviewResult,
  ImportPreviewRow,
  ImportSourceId,
  NormalizedImportRow,
} from "@/lib/import/core/types";
import { prismaImportAdapter } from "@/lib/import/adapters/prisma-import.adapter";
import { pfExpertParser } from "@/lib/import/sources/pf-expert/pf-expert.parser";
import { salesforceImportParser } from "@/lib/import/sources/salesforce/salesforce.parser";

function locationLabel(row: NormalizedImportRow): string {
  const { building, community, emirate, country } = row.location;
  return [building, community, emirate, country].filter(Boolean).join(", ");
}

function toPreviewRow(
  normalized: NormalizedImportRow,
  warnings: string[]
): ImportPreviewRow {
  return {
    rowNumber: normalized.rowNumber,
    propertyCode: normalized.propertyCode,
    listingType: normalized.listingType,
    askingPrice: normalized.askingPrice,
    currency: normalized.currency,
    locationLabel: locationLabel(normalized),
    agentName: normalized.agentName,
    qualityScore: normalized.qualityScore,
    normalized,
    warnings,
  };
}

function partitionDuplicates(validRows: ImportPreviewRow[]) {
  const seenCodes = new Map<string, ImportPreviewRow>();
  const seenRefs = new Map<string, ImportPreviewRow>();
  const duplicateInFile: ImportPreviewRow[] = [];
  const uniqueRows: ImportPreviewRow[] = [];

  for (const row of validRows) {
    const ref = row.normalized.pfExpertReference ?? row.propertyCode;
    const isDupCode = seenCodes.has(row.propertyCode);
    const isDupRef = seenRefs.has(ref);

    if (isDupCode || isDupRef) {
      duplicateInFile.push(row);
      continue;
    }

    seenCodes.set(row.propertyCode, row);
    seenRefs.set(ref, row);
    uniqueRows.push(row);
  }

  return { duplicateInFile, uniqueRows };
}

export class ImportService {
  private readonly csv = new CsvParser();
  private readonly parsers: Record<ImportSourceId, IImportSourceParser> = {
    "pf-expert": pfExpertParser,
    salesforce: salesforceImportParser,
  };

  getParser(source: ImportSourceId): IImportSourceParser {
    const parser = this.parsers[source];
    if (!parser) {
      throw new Error(`Unsupported import source: ${source}`);
    }
    return parser;
  }

  parseHeaders(csvText: string): ImportHeadersResult {
    const parsed = this.csv.parse(csvText);
    return {
      headers: parsed.headers,
      suggestedMapping: suggestColumnMapping(parsed.headers),
    };
  }

  async preview(
    source: ImportSourceId,
    csvText: string,
    fileName: string,
    columnMapping?: ImportColumnMapping
  ): Promise<ImportPreviewResult> {
    const parser = this.getParser(source);

    if (source === "pf-expert" && columnMapping) {
      pfExpertParser.setColumnMapping(columnMapping);
    }

    const parsed = parser.parseCsv(csvText, fileName);
    const mapping = columnMapping ?? suggestColumnMapping(parsed.headers);
    const mappingErrors = validateColumnMapping(mapping);

    if (mappingErrors.length > 0) {
      throw new Error(
        `Missing required column mappings: ${mappingErrors.join(", ")}`
      );
    }

    if (source === "pf-expert") {
      pfExpertParser.setColumnMapping(mapping);
    }

    const errors: ImportPreviewResult["errors"] = [];
    const warnings: ImportPreviewResult["warnings"] = [];
    const validRows: ImportPreviewRow[] = [];
    let skippedInvalid = 0;

    for (let i = 0; i < parsed.rows.length; i++) {
      const rowNumber = i + 2;
      const result = parser.normalizeRow(parsed.rows[i], rowNumber);

      errors.push(...result.errors);
      warnings.push(...result.warnings);

      if (!result.normalized) {
        skippedInvalid += 1;
        continue;
      }

      const rowWarnings = result.warnings.map((w) => w.message);
      validRows.push(toPreviewRow(result.normalized, rowWarnings));
    }

    const { duplicateInFile, uniqueRows } = partitionDuplicates(validRows);

    const codes = uniqueRows.map((r) => r.propertyCode);
    const refs = uniqueRows
      .map((r) => r.normalized.pfExpertReference)
      .filter((ref): ref is string => Boolean(ref));

    const [duplicateCodes, duplicateRefs] = await Promise.all([
      prismaImportAdapter.findDuplicatePropertyCodes(codes),
      prismaImportAdapter.findDuplicatePfExpertReferences(refs),
    ]);

    const newListings: ImportPreviewRow[] = [];
    const duplicateListings: ImportPreviewRow[] = [];

    for (const row of uniqueRows) {
      const ref = row.normalized.pfExpertReference ?? row.propertyCode;
      if (duplicateCodes.has(row.propertyCode) || duplicateRefs.has(ref)) {
        duplicateListings.push(row);
      } else {
        newListings.push(row);
      }
    }

    return {
      source,
      fileName,
      headers: parsed.headers,
      columnMapping: mapping,
      totalRows: parsed.rows.length,
      parsedRows: validRows.length,
      skippedInvalid,
      newListings,
      duplicateListings,
      duplicateInFile,
      errors,
      warnings,
    };
  }

  async commit(input: ImportCommitInput): Promise<ImportCommitResult> {
    const codes = input.rows.map((r) => r.propertyCode);
    const refs = input.rows
      .map((r) => r.pfExpertReference)
      .filter((ref): ref is string => Boolean(ref));

    const [duplicateCodes, duplicateRefs] = await Promise.all([
      prismaImportAdapter.findDuplicatePropertyCodes(codes),
      prismaImportAdapter.findDuplicatePfExpertReferences(refs),
    ]);

    const toImport = input.rows.filter((row) => {
      const ref = row.pfExpertReference ?? row.propertyCode;
      return !duplicateCodes.has(row.propertyCode) && !duplicateRefs.has(ref);
    });

    const skippedDuplicates = input.rows.length - toImport.length;

    if (toImport.length === 0) {
      return {
        imported: 0,
        skipped: skippedDuplicates,
        duplicates: skippedDuplicates,
        errors: [],
        propertyIds: [],
      };
    }

    try {
      const propertyIds = await prismaImportAdapter.importRows(
        toImport,
        input.source
      );

      return {
        imported: propertyIds.length,
        skipped: skippedDuplicates,
        duplicates: skippedDuplicates,
        errors: [],
        propertyIds,
      };
    } catch (error) {
      return {
        imported: 0,
        skipped: skippedDuplicates,
        duplicates: skippedDuplicates,
        errors: [
          {
            rowNumber: 0,
            message:
              error instanceof Error
                ? error.message
                : "Import failed — transaction rolled back",
          },
        ],
        propertyIds: [],
      };
    }
  }
}

export const importService = new ImportService();
