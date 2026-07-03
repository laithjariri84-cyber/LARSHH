export class NumericParser {
  parseOptionalInt(value: string): number | null {
    if (!value?.trim()) return null;
    const num = Number(value.replace(/[^\d.]/g, ""));
    return Number.isNaN(num) ? null : Math.trunc(num);
  }

  parseOptionalDecimal(value: string): number | null {
    if (!value?.trim()) return null;
    const num = Number(value.replace(/[^\d.]/g, ""));
    return Number.isNaN(num) ? null : num;
  }
}

export const numericParser = new NumericParser();
