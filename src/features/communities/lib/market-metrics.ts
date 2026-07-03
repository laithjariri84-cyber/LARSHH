import { formatCurrency, formatLabel } from "@/lib/utils";
import type { CommunityMarketSummary } from "@/lib/market-intelligence/summary";
import { formatRentRange } from "@/lib/market-intelligence/summary";

import type { IntelligenceMetric } from "../types";

export function buildMarketMetricsFromSummary(
  summary: CommunityMarketSummary | null
): {
  averageRent: IntelligenceMetric;
  averageSale: IntelligenceMetric;
  roi: IntelligenceMetric;
  pricePerSqft: IntelligenceMetric;
} {
  if (!summary?.available) {
    const unavailable = "Market data not available";
    return {
      averageRent: { label: "Average Rent", value: unavailable },
      averageSale: { label: "Average Sale", value: unavailable },
      roi: { label: "ROI", value: unavailable },
      pricePerSqft: { label: "Price per Sq.ft", value: unavailable },
    };
  }

  return {
    averageRent: {
      label: "Average Rent",
      value:
        summary.averageRent !== null
          ? `${formatCurrency(summary.averageRent, "AED")}/yr`
          : "Market data not available",
      hint: formatRentRange(
        summary.unfurnishedRentMin,
        summary.unfurnishedRentMax
      )
        ? `Unfurnished range: ${formatRentRange(summary.unfurnishedRentMin, summary.unfurnishedRentMax)}`
        : undefined,
    },
    averageSale: {
      label: "Average Sale",
      value: formatCurrency(summary.averageSalePrice, "AED"),
      hint:
        summary.lowestSalePrice !== null && summary.highestSalePrice !== null
          ? `${formatCurrency(summary.lowestSalePrice, "AED")} – ${formatCurrency(summary.highestSalePrice, "AED")}`
          : undefined,
    },
    roi: {
      label: "ROI",
      value:
        summary.roi !== null
          ? `${Math.round(summary.roi * 10) / 10}%`
          : "Market data not available",
      hint:
        summary.confidence !== null
          ? `${Math.round(summary.confidence)}% confidence · ${summary.demand ? formatLabel(summary.demand) : "Demand n/a"} demand`
          : undefined,
    },
    pricePerSqft: {
      label: "Price per Sq.ft",
      value: formatCurrency(summary.pricePerSqft, "AED"),
      hint: summary.isEstimated ? "Estimated community benchmark" : "Research-backed benchmark",
    },
  };
}
