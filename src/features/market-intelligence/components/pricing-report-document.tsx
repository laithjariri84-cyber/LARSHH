import type { MarketAnalytics, MarketFilters } from "../types";
import {
  formatCurrency,
  formatPercent,
} from "../lib/generate-market-analytics";
import { MarketScoreBadge } from "./market-score-panel";

type PricingReportDocumentProps = {
  filters: MarketFilters;
  analytics: MarketAnalytics;
  generatedAt: string;
};

export function PricingReportDocument({
  filters,
  analytics,
  generatedAt,
}: PricingReportDocumentProps) {
  const { summary, marketScore, comparables } = analytics;

  return (
    <div className="pricing-report-print bg-white text-black">
      <header className="border-b border-black/10 pb-6">
        <p className="text-xs font-semibold tracking-[0.25em] text-amber-700 uppercase">
          LARSSH · AI Real Estate Intelligence Platform
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Pricing Intelligence Report
        </h1>
        <p className="mt-2 text-sm text-black/60">Generated {generatedAt}</p>
      </header>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-wider uppercase">
          Market Scope
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {Object.entries(filters).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-black/10 px-3 py-2">
              <p className="text-[10px] tracking-wider uppercase text-black/50">
                {key.replace(/([A-Z])/g, " $1")}
              </p>
              <p className="mt-1 font-medium">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-wider uppercase">
          Market Summary
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <ReportMetric label="Average Asking Price" value={formatCurrency(summary.averageAskingPrice)} />
          <ReportMetric label="Average Rent" value={`${formatCurrency(summary.averageRent)}/yr`} />
          <ReportMetric label="Average Price per Sq.ft" value={`$${summary.averagePricePerSqft.toLocaleString()}`} />
          <ReportMetric label="Average ROI" value={`${summary.averageRoi.toFixed(1)}%`} />
          <ReportMetric label="Median Price" value={formatCurrency(summary.medianPrice)} />
          <ReportMetric label="Active Listings" value={String(summary.activeListings)} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-wider uppercase">
          Market Score
        </h2>
        <div className="mt-4 rounded-lg border border-black/10 p-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold uppercase">
              {marketScore.headline}
            </span>
            <span className="text-sm text-black/60">Score {marketScore.score}/100</span>
          </div>
          <p className="mt-3 text-sm leading-7 text-black/70">{marketScore.rationale}</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-wider uppercase">
          Comparable Listings
        </h2>
        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-[11px] tracking-wider uppercase text-black/50">
              <th className="py-2 pr-3">Property</th>
              <th className="py-2 pr-3">Building</th>
              <th className="py-2 pr-3">Price</th>
              <th className="py-2 pr-3">Size</th>
              <th className="py-2 pr-3">Price/sqft</th>
              <th className="py-2 pr-3">Diff %</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {comparables.map((listing) => (
              <tr key={listing.id} className="border-b border-black/5">
                <td className="py-2 pr-3 font-medium">{listing.property}</td>
                <td className="py-2 pr-3">{listing.building}</td>
                <td className="py-2 pr-3">{formatCurrency(listing.price)}</td>
                <td className="py-2 pr-3">{listing.size.toLocaleString()} sqft</td>
                <td className="py-2 pr-3">${listing.pricePerSqft.toLocaleString()}</td>
                <td className="py-2 pr-3">{formatPercent(listing.differencePercent)}</td>
                <td className="py-2">{listing.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="mt-10 border-t border-black/10 pt-4 text-xs text-black/50">
        Confidential · Mock intelligence preview · Not for external distribution
      </footer>
    </div>
  );
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 px-3 py-2">
      <p className="text-[10px] tracking-wider uppercase text-black/50">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

export function PricingReportScreenPreview({
  filters,
  analytics,
  generatedAt,
}: PricingReportDocumentProps) {
  return (
    <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-white/10 bg-zinc-950 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-gold text-[11px] tracking-[0.2em] uppercase">
            Report Preview
          </p>
          <h3 className="mt-1 text-lg font-semibold">Pricing Intelligence Report</h3>
        </div>
        <MarketScoreBadge level={analytics.marketScore.level} />
      </div>
      <div className="rounded-xl border border-white/10 bg-white p-6 text-black shadow-2xl">
        <PricingReportDocument
          filters={filters}
          analytics={analytics}
          generatedAt={generatedAt}
        />
      </div>
    </div>
  );
}
