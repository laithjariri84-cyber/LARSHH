export class QualityScoreParser {
  parse(value: string): { score: number | null; warning?: string } {
    if (!value?.trim()) return { score: null };

    const cleaned = value.replace(/%/g, "").trim();
    const num = Number(cleaned);
    if (Number.isNaN(num)) {
      return { score: null, warning: `Invalid quality score: ${value}` };
    }

    const clamped = Math.min(100, Math.max(0, num));
    return { score: Math.round(clamped * 100) / 100 };
  }
}

export const qualityScoreParser = new QualityScoreParser();
