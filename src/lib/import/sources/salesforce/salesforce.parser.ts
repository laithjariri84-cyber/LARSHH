import type { IImportSourceParser } from "@/lib/import/core/import-pipeline.interface";

/**
 * Salesforce adapter stub — implements the same pipeline contract as PF Expert.
 * Map Salesforce export columns in normalizeRow() when CRM sync is enabled.
 */
export class SalesforceImportParser implements IImportSourceParser {
  readonly sourceId = "salesforce" as const;

  parseCsv(): never {
    throw new Error("Salesforce import adapter not configured yet");
  }

  normalizeRow(): never {
    throw new Error("Salesforce import adapter not configured yet");
  }
}

export const salesforceImportParser = new SalesforceImportParser();
