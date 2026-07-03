import type { PropertyAggregate, PropertySummary } from "@/domain/property";

/** JSON-serializable property summary for API responses. */
export type PropertySummaryDto = PropertySummary;

/** JSON-serializable property aggregate for API responses. */
export type PropertyAggregateDto = PropertyAggregate;

export function toPropertySummaryDto(
  summary: PropertySummary
): PropertySummaryDto {
  return summary;
}

export function toPropertyAggregateDto(
  aggregate: PropertyAggregate
): PropertyAggregateDto {
  return aggregate;
}
