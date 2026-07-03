const UAE_EMIRATES = [
  "abu dhabi",
  "dubai",
  "sharjah",
  "ajman",
  "umm al quwain",
  "ras al khaimah",
  "fujairah",
  "rak",
  "uae",
  "united arab emirates",
] as const;

const EMIRATE_ALIASES: Record<string, string> = {
  rak: "Ras Al Khaimah",
  "ras al khaima": "Ras Al Khaimah",
  "ras al khaimah": "Ras Al Khaimah",
  "abu dhabi": "Abu Dhabi",
  dubai: "Dubai",
  sharjah: "Sharjah",
  ajman: "Ajman",
  "umm al quwain": "Umm Al Quwain",
  fujairah: "Fujairah",
};

export type LocationParseInput = {
  location?: string;
  country?: string;
  emirate?: string;
  masterCommunity?: string;
  community?: string;
  building?: string;
};

export type LocationParseResult = {
  country: string;
  emirate: string;
  masterCommunity: string;
  community: string;
  building: string;
  warnings: string[];
};

export class LocationParser {
  parse(input: LocationParseInput): LocationParseResult {
    const warnings: string[] = [];

    if (input.country && input.emirate && input.masterCommunity) {
      return {
        country: this.normalizeCountry(input.country),
        emirate: this.normalizeEmirate(input.emirate),
        masterCommunity: input.masterCommunity.trim(),
        community: (input.community ?? input.masterCommunity).trim(),
        building: (input.building ?? input.community ?? "General").trim(),
        warnings,
      };
    }

    const raw = input.location?.trim() ?? "";
    if (!raw) {
      return {
        country: input.country?.trim() || "United Arab Emirates",
        emirate: this.normalizeEmirate(input.emirate ?? ""),
        masterCommunity: input.masterCommunity?.trim() || "Unknown Master Community",
        community: input.community?.trim() || "Unknown Community",
        building: input.building?.trim() || "General",
        warnings: ["Location missing — defaulted hierarchy"],
      };
    }

    const parts = raw
      .split(/[,|>/]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    let country = input.country?.trim() ?? "";
    let emirate = input.emirate?.trim() ?? "";
    let masterCommunity = input.masterCommunity?.trim() ?? "";
    let community = input.community?.trim() ?? "";
    let building = input.building?.trim() ?? "";

    const last = parts[parts.length - 1]?.toLowerCase() ?? "";
    const secondLast = parts[parts.length - 2]?.toLowerCase() ?? "";

    if (!country && this.isCountry(last)) {
      country = parts.pop()!;
    }
    if (!emirate && parts.length > 0 && this.isEmirate(secondLast)) {
      emirate = parts.pop()!;
    } else if (!emirate && parts.length > 0 && this.isEmirate(last)) {
      emirate = parts.pop()!;
    }

    country = this.normalizeCountry(country || "United Arab Emirates");
    emirate = this.normalizeEmirate(emirate || parts.pop() || "Ras Al Khaimah");

    const remaining = [...parts];
    if (!building && remaining.length >= 1) building = remaining[0] ?? "General";
    if (!community && remaining.length >= 2) {
      community = remaining[1] ?? remaining[0] ?? "Unknown Community";
    } else if (!community && remaining.length === 1) {
      community = remaining[0] ?? "Unknown Community";
    }
    if (!masterCommunity && remaining.length >= 3) {
      masterCommunity = remaining[2] ?? remaining[1] ?? community;
    } else if (!masterCommunity && remaining.length >= 2) {
      masterCommunity = remaining[1] ?? community;
    } else if (!masterCommunity) {
      masterCommunity = community || "Unknown Master Community";
      warnings.push("Master community inferred from community");
    }

    if (!community) community = masterCommunity;
    if (!building) building = community;

    return { country, emirate, masterCommunity, community, building, warnings };
  }

  private isCountry(value: string): boolean {
    return ["uae", "united arab emirates", "u.a.e"].includes(value.toLowerCase());
  }

  private isEmirate(value: string): boolean {
    const v = value.toLowerCase();
    return UAE_EMIRATES.some((e) => v.includes(e) || e.includes(v));
  }

  private normalizeCountry(value: string): string {
    const v = value.toLowerCase();
    if (v === "uae" || v === "u.a.e") return "United Arab Emirates";
    return value.trim();
  }

  private normalizeEmirate(value: string): string {
    const key = value.trim().toLowerCase();
    if (EMIRATE_ALIASES[key]) return EMIRATE_ALIASES[key];
    if (key.includes("ras al khaim")) return "Ras Al Khaimah";
    return value.trim() || "Ras Al Khaimah";
  }
}

export const locationParser = new LocationParser();
