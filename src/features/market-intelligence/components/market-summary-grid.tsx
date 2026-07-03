import type { MarketSummary } from "../types";
import { formatCurrency } from "../lib/generate-market-analytics";

type MarketSummaryGridProps = {
  summary: MarketSummary;
};

const METRICS: Array<{
  key: keyof MarketSummary;
  label: string;
  format: (value: number) => string;
}> = [
  { key: "averageAskingPrice", label: "Average Asking Price", format: formatCurrency },
  { key: "averageRent", label: "Average Rent", format: (value) => `${formatCurrency(value)}/yr` },
  { key: "averagePricePerSqft", label: "Average Price per Sq.ft", format: (value) => `$${value.toLocaleString()}` },
  { key: "averageRoi", label: "Average ROI", format: (value) => `${value.toFixed(1)}%` },
  { key: "lowestListing", label: "Lowest Listing", format: formatCurrency },
  { key: "highestListing", label: "Highest Listing", format: formatCurrency },
  { key: "medianPrice", label: "Median Price", format: formatCurrency },
  { key: "activeListings", label: "Active Listings", format: (value) => String(value) },
  { key: "averageDaysOnMarket", label: "Average Days on Market", format: (value) => `${value} days` },
];

export function MarketSummaryGrid({ summary }: MarketSummaryGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {METRICS.map((metric, index) => (
        <div
          key={metric.key}
          className="animate-slide-up rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-gold/15"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <p className="text-muted-foreground text-[11px] tracking-wider uppercase">
            {metric.label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {metric.format(summary[metric.key])}
          </p>
        </div>
      ))}
    </div>
  );
}
