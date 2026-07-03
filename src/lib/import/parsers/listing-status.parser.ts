import { ListingStatus } from "@prisma/client";

export class ListingStatusParser {
  private static readonly MAP: Record<string, ListingStatus> = {
    draft: ListingStatus.DRAFT,
    active: ListingStatus.ACTIVE,
    live: ListingStatus.ACTIVE,
    published: ListingStatus.ACTIVE,
    pending: ListingStatus.PENDING,
    sold: ListingStatus.SOLD,
    rented: ListingStatus.RENTED,
    let: ListingStatus.RENTED,
    withdrawn: ListingStatus.WITHDRAWN,
    expired: ListingStatus.EXPIRED,
    inactive: ListingStatus.WITHDRAWN,
    archived: ListingStatus.WITHDRAWN,
  };

  parse(value: string): { status: ListingStatus | null; error?: string } {
    const key = value.trim().toLowerCase();
    if (!key) return { status: ListingStatus.DRAFT };

    const direct = ListingStatusParser.MAP[key];
    if (direct) return { status: direct };

    for (const [pattern, status] of Object.entries(ListingStatusParser.MAP)) {
      if (key.includes(pattern)) return { status };
    }

    return { status: null, error: `Unknown listing state: ${value}` };
  }
}

export const listingStatusParser = new ListingStatusParser();
