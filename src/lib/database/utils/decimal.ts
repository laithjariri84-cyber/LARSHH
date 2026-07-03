import type { Decimal } from "@prisma/client/runtime/library";

/** Convert Prisma Decimal to JavaScript number for DTOs and domain mapping. */
export function decimalToNumber(
  value: Decimal | null | undefined
): number | null {
  if (value === null || value === undefined) return null;
  return value.toNumber();
}

/** Convert number to string for Prisma Decimal fields. */
export function numberToDecimalString(value: number): string {
  return value.toFixed(2);
}
