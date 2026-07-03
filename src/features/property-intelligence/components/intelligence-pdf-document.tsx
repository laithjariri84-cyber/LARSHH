import type { IntelligenceAnalytics, IntelligenceFilters } from "../types";
import {
  formatCurrency,
  formatLevel,
  formatTrend,
} from "../lib/generate-intelligence-report";

type IntelligencePdfDocumentProps = {
  filters: IntelligenceFilters;
  analytics: IntelligenceAnalytics;
  generatedAt: string;
};

export function IntelligencePdfDocument({
  filters,
  analytics,
  generatedAt,
}: IntelligencePdfDocumentProps) {
  const { report, comparables, scopeLabel } = analytics;
  const price = (value: number) => formatCurrency(value, filters.purpose);

  return (
    <div className="pricing-report-print bg-white p-8 text-black">
      <header className="border-b border-black/10 pb-6">
        <p className="text-xs font-semibold tracking-[0.25em] text-amber-700 uppercase">
          LARSSH · AI Real Estate Intelligence Platform
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Property Intelligence Report
        </h1>
        <p className="mt-2 text-sm text-black/60">{scopeLabel}</p>
        <p className="mt-1 text-sm text-black/60">Generated {generatedAt}</p>
      </header>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-wider uppercase">
          Market Confidence
        </h2>
        <p className="mt-3 text-4xl font-semibold">{report.marketConfidence}%</p>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-3 text-sm">
        <Metric label="Estimated Market Value" value={price(report.estimatedMarketValue)} />
        <Metric label="Suggested Listing Price" value={price(report.suggestedListingPrice)} />
        <Metric label="Suggested Closing Price" value={price(report.suggestedClosingPrice)} />
        <Metric label="Average Asking Price" value={price(report.averageAskingPrice)} />
        <Metric label="Lowest Asking Price" value={price(report.lowestAskingPrice)} />
        <Metric label="Highest Asking Price" value={price(report.highestAskingPrice)} />
        <Metric label="Average Price per Sq.ft" value={`$${report.averagePricePerSqft}`} />
        <Metric label="Average ROI" value={`${report.averageRoi}%`} />
        <Metric label="Average Days on Market" value={`${report.averageDaysOnMarket} days`} />
        <Metric label="Holiday Home Score" value={`${report.holidayHomeScore}/100`} />
        <Metric label="Investment Score" value={`${report.investmentScore}/100`} />
        <Metric label="Rental Yield" value={`${report.rentalYield}%`} />
        <Metric label="Price Trend" value={formatTrend(report.priceTrend)} />
        <Metric label="Market Trend" value={formatTrend(report.marketTrend)} />
        <Metric label="Supply Level" value={formatLevel(report.supplyLevel)} />
        <Metric label="Demand Level" value={formatLevel(report.demandLevel)} />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-wider uppercase">
          Comparable Listings
        </h2>
        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-[11px] uppercase text-black/50">
              <th className="py-2 pr-3">Building</th>
              <th className="py-2 pr-3">Size</th>
              <th className="py-2 pr-3">Price</th>
              <th className="py-2 pr-3">Price/sqft</th>
              <th className="py-2 pr-3">Diff %</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {comparables.map((listing) => (
              <tr key={listing.id} className="border-b border-black/5">
                <td className="py-2 pr-3">{listing.building}</td>
                <td className="py-2 pr-3">{listing.size.toLocaleString()} sqft</td>
                <td className="py-2 pr-3">{price(listing.price)}</td>
                <td className="py-2 pr-3">${listing.pricePerSqft.toLocaleString()}</td>
                <td className="py-2 pr-3">
                  {listing.differencePercent > 0 ? "+" : ""}
                  {listing.differencePercent}%
                </td>
                <td className="py-2">{listing.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 px-3 py-2">
      <p className="text-[10px] tracking-wider uppercase text-black/50">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

export function IntelligencePdfPreview({
  filters,
  analytics,
  generatedAt,
}: IntelligencePdfDocumentProps) {
  return (
    <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-white/10 bg-zinc-950 p-4">
      <div className="rounded-xl border border-white/10 bg-white p-6 text-black shadow-2xl">
        <IntelligencePdfDocument
          filters={filters}
          analytics={analytics}
          generatedAt={generatedAt}
        />
      </div>
    </div>
  );
}
