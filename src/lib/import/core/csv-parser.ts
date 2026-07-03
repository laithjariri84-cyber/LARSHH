import Papa from "papaparse";

import type { CsvParseResult, RawImportRow } from "./import-pipeline.interface";

/** Normalize CSV header for fuzzy column matching. */
export function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^\w\s/]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\//g, " ");
}

export class CsvParser {
  parse(csvText: string): CsvParseResult {
    const result = Papa.parse<string[]>(csvText, {
      header: false,
      skipEmptyLines: "greedy",
      transform: (value) => value.trim(),
    });

    if (result.errors.length > 0) {
      const fatal = result.errors.find((e) => e.type === "Quotes");
      if (fatal) {
        throw new Error(`CSV parse error: ${fatal.message}`);
      }
    }

    const data = result.data.filter((row) => row.some((cell) => cell?.trim()));
    if (data.length === 0) {
      return { headers: [], rows: [] };
    }

    const headers = data[0].map(normalizeHeader);
    const rows: RawImportRow[] = [];

    for (let i = 1; i < data.length; i++) {
      const cells = data[i];
      const record: RawImportRow = {};
      headers.forEach((header, index) => {
        if (!header) return;
        record[header] = (cells[index] ?? "").trim();
      });
      rows.push(record);
    }

    return { headers, rows };
  }

  getCell(row: RawImportRow, aliases: string[]): string {
    for (const alias of aliases) {
      const key = normalizeHeader(alias);
      if (row[key]) return row[key];
    }
    return "";
  }
}

export type { RawImportRow };
