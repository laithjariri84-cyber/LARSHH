export class PriceParser {
  parse(value: string): { price: number | null; error?: string } {
    if (!value?.trim()) {
      return { price: null, error: "Price is required" };
    }

    const cleaned = value.replace(/[^\d.]/g, "");
    const num = Number(cleaned);
    if (Number.isNaN(num) || num <= 0) {
      return { price: null, error: `Invalid price: ${value}` };
    }

    return { price: num };
  }
}

export const priceParser = new PriceParser();
