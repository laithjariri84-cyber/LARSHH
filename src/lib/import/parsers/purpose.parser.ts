import { ListingType } from "@prisma/client";

export class ListingTypeParser {
  parse(value: string): { listingType: ListingType | null; error?: string } {
    const v = value.trim().toLowerCase();
    if (!v) return { listingType: null, error: "Rent / Sale is required" };

    if (v.includes("sale") || v === "buy" || v === "sell" || v.includes("invest")) {
      return { listingType: ListingType.SALE };
    }
    if (
      v.includes("rent") ||
      v.includes("lease") ||
      v.includes("holiday")
    ) {
      return { listingType: ListingType.RENT };
    }

    return { listingType: null, error: `Unknown listing type: ${value}` };
  }
}

export const listingTypeParser = new ListingTypeParser();

/** @deprecated Use listingTypeParser */
export const purposeParser = listingTypeParser;
