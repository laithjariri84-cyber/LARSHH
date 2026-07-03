import { PropertyType } from "@prisma/client";

export class PropertyTypeParser {
  private static readonly MAP: Record<string, PropertyType> = {
    apartment: PropertyType.APARTMENT,
    apartments: PropertyType.APARTMENT,
    flat: PropertyType.APARTMENT,
    villa: PropertyType.VILLA,
    townhouse: PropertyType.TOWNHOUSE,
    "town house": PropertyType.TOWNHOUSE,
    duplex: PropertyType.DUPLEX,
    duplexes: PropertyType.DUPLEX,
    penthouse: PropertyType.PENTHOUSE,
    office: PropertyType.OFFICE,
    retail: PropertyType.RETAIL,
    shop: PropertyType.RETAIL,
    warehouse: PropertyType.WAREHOUSE,
    land: PropertyType.LAND,
    plot: PropertyType.LAND,
  };

  parse(value: string): { propertyType: PropertyType | null; error?: string } {
    const key = value.trim().toLowerCase();
    if (!key) return { propertyType: null, error: "Property Type is required" };

    const direct = PropertyTypeParser.MAP[key];
    if (direct) return { propertyType: direct };

    for (const [pattern, type] of Object.entries(PropertyTypeParser.MAP)) {
      if (key.includes(pattern)) return { propertyType: type };
    }

    if (key.includes("other")) return { propertyType: PropertyType.OTHER };

    return { propertyType: null, error: `Unknown property type: ${value}` };
  }
}

export const propertyTypeParser = new PropertyTypeParser();
