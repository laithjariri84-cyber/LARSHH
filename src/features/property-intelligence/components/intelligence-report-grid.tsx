import type { IntelligenceReport } from "../types";
import {
  formatCurrency,
  formatLevel,
  formatTrend,
} from "../lib/generate-intelligence-report";
import { formatCurrency as formatAed } from "@/lib/utils";
import { TerminalMetric, TerminalSection } from "./terminal-metric";

type IntelligenceReportGridProps = {
  report: IntelligenceReport;
  purpose: "Rent" | "Sale";
};

export function IntelligenceReportGrid({
  report,
  purpose,
}: IntelligenceReportGridProps) {
  const price = (value: number) => formatCurrency(value, purpose);

  return (
    <TerminalSection title="Property Intelligence Report">
      <div className="intelligence-terminal rounded-2xl border border-gold/15 p-5 md:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <TerminalMetric
            label="Estimated Market Value"
            value={price(report.estimatedMarketValue)}
            accent
          />
          <TerminalMetric
            label="Suggested Listing Price"
            value={price(report.suggestedListingPrice)}
          />
          <TerminalMetric
            label="Suggested Closing Price"
            value={price(report.suggestedClosingPrice)}
          />
          <TerminalMetric
            label="Average Asking Price"
            value={price(report.averageAskingPrice)}
          />
          <TerminalMetric
            label="Lowest Asking Price"
            value={price(report.lowestAskingPrice)}
          />
          <TerminalMetric
            label="Highest Asking Price"
            value={price(report.highestAskingPrice)}
          />
          <TerminalMetric
            label="Average Price per Sq.ft"
            value={formatAed(report.averagePricePerSqft, "AED")}
          />
          <TerminalMetric
            label="Average ROI"
            value={`${report.averageRoi.toFixed(1)}%`}
          />
          <TerminalMetric
            label="Average Days on Market"
            value={`${report.averageDaysOnMarket}`}
            hint="days"
          />
          <TerminalMetric
            label="Holiday Home Score"
            value={`${report.holidayHomeScore}/100`}
          />
          <TerminalMetric
            label="Investment Score"
            value={`${report.investmentScore}/100`}
            accent
          />
          <TerminalMetric
            label="Rental Yield"
            value={`${report.rentalYield.toFixed(1)}%`}
          />
          <TerminalMetric
            label="Price Trend"
            value={formatTrend(report.priceTrend)}
          />
          <TerminalMetric
            label="Market Trend"
            value={formatTrend(report.marketTrend)}
          />
          <TerminalMetric
            label="Supply Level"
            value={formatLevel(report.supplyLevel)}
          />
          <TerminalMetric
            label="Demand Level"
            value={formatLevel(report.demandLevel)}
          />
        </div>
      </div>
    </TerminalSection>
  );
}
