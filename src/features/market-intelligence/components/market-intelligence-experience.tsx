"use client";

import { useMemo, useState } from "react";
import { Building2, Scale } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LARSSH_BRAND } from "@/lib/brand";
import { formatCurrency, formatLabel } from "@/lib/utils";
import {
  bedroomLabel,
  buildCommunityMarketSummary,
  formatRentRange,
  type CommunityMarketSummary,
} from "@/lib/market-intelligence/summary";

import { MarketSection } from "./market-section";

const BEDROOM_OPTIONS = [
  { value: "all", label: "All unit types" },
  { value: "0", label: "Studio" },
  { value: "1", label: "1 Bedroom" },
  { value: "2", label: "2 Bedroom" },
  { value: "3", label: "3 Bedroom" },
];

type MarketIntelligenceExperienceProps = {
  summaries: CommunityMarketSummary[];
};

function formatAed(value: number | null | undefined) {
  if (value === null || value === undefined) return "Not yet researched";
  return formatCurrency(value, "AED");
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "Not yet researched";
  return `${Math.round(value * 10) / 10}%`;
}

export function MarketIntelligenceExperience({
  summaries,
}: MarketIntelligenceExperienceProps) {
  const [communitySlug, setCommunitySlug] = useState(
    summaries[0]?.communitySlug ?? ""
  );
  const [bedroomFilter, setBedroomFilter] = useState("all");

  const selectedSummary = useMemo(() => {
    const community = summaries.find(
      (summary) => summary.communitySlug === communitySlug
    );
    if (!community) return null;

    if (bedroomFilter === "all") {
      return community;
    }

    const bedroomCount = Number(bedroomFilter);
    const profile = community.profiles.find(
      (row) => row.bedroomCount === bedroomCount
    );

    if (!profile) {
      return buildCommunityMarketSummary(
        community.communitySlug,
        community.communityName,
        []
      );
    }

    return buildCommunityMarketSummary(
      community.communitySlug,
      community.communityName,
      [profile]
    );
  }, [summaries, communitySlug, bedroomFilter]);

  if (summaries.length === 0) {
    return (
      <div className="space-y-8 p-4 md:p-6 lg:p-8">
        <header className="animate-slide-up">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Market Intelligence
          </h1>
          <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-7 md:text-base">
            Community research profiles appear here after the founder saves manual
            market intelligence in Admin.
          </p>
        </header>
        <p className="text-muted-foreground rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm">
          Not yet researched
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <header className="animate-slide-up">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-gold/20 bg-gold-muted text-gold text-[10px]"
              >
                {LARSSH_BRAND.shortTagline}
              </Badge>
              <Badge variant="outline" className="border-white/10 text-[10px]">
                Live research database
              </Badge>
            </div>
            <p className="text-gold mt-4 text-sm font-medium tracking-[0.2em] uppercase">
              LARSSH
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Market Intelligence
            </h1>
            <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-7 md:text-base">
              Community pricing benchmarks sourced from the LARSSH Market
              Intelligence database. All values are in AED.
            </p>
          </div>
        </div>
      </header>

      <div className="paragon-card animate-slide-up rounded-2xl p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground mb-2 text-xs uppercase tracking-wide">
              Community
            </p>
            <Select value={communitySlug} onValueChange={setCommunitySlug}>
              <SelectTrigger>
                <SelectValue placeholder="Select community" />
              </SelectTrigger>
              <SelectContent>
                {summaries.map((summary) => (
                  <SelectItem
                    key={summary.communitySlug}
                    value={summary.communitySlug}
                  >
                    {summary.communityName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-muted-foreground mb-2 text-xs uppercase tracking-wide">
              Unit type
            </p>
            <Select value={bedroomFilter} onValueChange={setBedroomFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit type" />
              </SelectTrigger>
              <SelectContent>
                {BEDROOM_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <MarketSection
        title="Community Market Data"
        description={
          selectedSummary?.available
            ? `${selectedSummary.communityName}${
                bedroomFilter !== "all"
                  ? ` · ${bedroomLabel(Number(bedroomFilter))}`
                  : ""
              }`
            : "No market intelligence profile matched this selection."
        }
        icon={Scale}
      >
        {!selectedSummary?.available ? (
          <p className="text-muted-foreground rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm">
            Not yet researched
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label="Average Sale Price"
              value={formatAed(selectedSummary.averageSalePrice)}
            />
            <MetricCard
              label="Lowest Sale Price"
              value={formatAed(selectedSummary.lowestSalePrice)}
            />
            <MetricCard
              label="Highest Sale Price"
              value={formatAed(selectedSummary.highestSalePrice)}
            />
            <MetricCard
              label="Average Rent"
              value={
                selectedSummary.averageRent !== null
                  ? `${formatAed(selectedSummary.averageRent)}/yr`
                  : "Not yet researched"
              }
            />
            <MetricCard
              label="Furnished Rent Range"
              value={
                formatRentRange(
                  selectedSummary.furnishedRentMin,
                  selectedSummary.furnishedRentMax
                ) ?? "Not yet researched"
              }
            />
            <MetricCard
              label="Unfurnished Rent Range"
              value={
                formatRentRange(
                  selectedSummary.unfurnishedRentMin,
                  selectedSummary.unfurnishedRentMax
                ) ?? "Not yet researched"
              }
            />
            <MetricCard
              label="ROI"
              value={formatPercent(selectedSummary.roi)}
            />
            <MetricCard
              label="Price per Sq.ft"
              value={formatAed(selectedSummary.pricePerSqft)}
            />
            <MetricCard
              label="Demand"
              value={
                selectedSummary.demand
                  ? formatLabel(selectedSummary.demand)
                  : "Not yet researched"
              }
            />
            <MetricCard
              label="Confidence"
              value={
                selectedSummary.confidence !== null
                  ? `${Math.round(selectedSummary.confidence)}%`
                  : "Not yet researched"
              }
            />
          </div>
        )}
      </MarketSection>

      <MarketSection
        title="Community Coverage"
        description="All communities indexed in the Market Intelligence database."
        icon={Building2}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {summaries.map((summary) => (
            <button
              key={summary.communitySlug}
              type="button"
              onClick={() => setCommunitySlug(summary.communitySlug)}
              className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-4 text-left transition-colors hover:border-gold/20"
            >
              <p className="font-medium">{summary.communityName}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {summary.available
                  ? `${formatAed(summary.averageSalePrice)} avg sale · ${formatPercent(summary.roi)} ROI`
                  : "Not yet researched"}
              </p>
              {summary.isEstimated ? (
                <Badge
                  variant="outline"
                  className="mt-3 border-gold/30 text-gold text-[10px]"
                >
                  Estimated
                </Badge>
              ) : null}
            </button>
          ))}
        </div>
      </MarketSection>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="animate-slide-up rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-gold/15">
      <p className="text-muted-foreground text-[11px] tracking-wider uppercase">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
