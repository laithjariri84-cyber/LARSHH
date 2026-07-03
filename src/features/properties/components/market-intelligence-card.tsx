import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  Gauge,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatLabel, formatNumber } from "@/lib/utils";
import type { PropertyMarketIntelligence } from "@/server/market-intelligence";

import { SectionCard } from "./section-card";

type MarketIntelligenceCardProps = {
  intelligence: PropertyMarketIntelligence;
};

const TONE_STYLES = {
  green: {
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]",
    diff: "text-emerald-400",
  },
  yellow: {
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.55)]",
    diff: "text-amber-300",
  },
  orange: {
    badge: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    dot: "bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.55)]",
    diff: "text-orange-300",
  },
  red: {
    badge: "border-red-500/30 bg-red-500/10 text-red-300",
    dot: "bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.55)]",
    diff: "text-red-300",
  },
} as const;

function formatAed(value: number | null | undefined) {
  return formatCurrency(value, "AED");
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value * 10) / 10}%`;
}

export function MarketIntelligenceCard({
  intelligence,
}: MarketIntelligenceCardProps) {
  const tone =
    intelligence.recommendationTone &&
    TONE_STYLES[intelligence.recommendationTone];

  return (
    <SectionCard
      title="Market Intelligence"
      description={`${intelligence.communityName} · ${intelligence.bedroomLabel} · LARSSH research database`}
      action={
        <div className="flex items-center gap-2">
          {intelligence.isEstimated ? (
            <Badge variant="outline" className="border-gold/30 text-gold">
              Estimated
            </Badge>
          ) : null}
          {intelligence.recommendation && tone ? (
            <Badge className={cn("gap-2 border px-3 py-1", tone.badge)}>
              <span className={cn("size-2 rounded-full", tone.dot)} />
              {intelligence.recommendation}
            </Badge>
          ) : null}
        </div>
      }
      className="border-gold/10"
    >
      <div className="from-gold/[0.08] relative overflow-hidden rounded-2xl border border-gold/15 bg-gradient-to-br via-transparent to-transparent p-5">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.12),transparent_70%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-muted-foreground flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em]">
              <Sparkles className="text-gold size-3.5" />
              Current Asking Price
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              {formatAed(intelligence.currentAskingPrice)}
            </p>
            {intelligence.listingType ? (
              <p className="text-muted-foreground mt-2 text-sm">
                {formatLabel(intelligence.listingType)} listing
                {intelligence.furnishing
                  ? ` · ${formatLabel(intelligence.furnishing)}`
                  : ""}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="larssh-glass rounded-xl px-4 py-3">
              <p className="text-muted-foreground text-[11px] uppercase tracking-wide">
                Market Range
              </p>
              <p className="mt-1 text-sm font-semibold">
                {formatAed(intelligence.marketRangeLow)} –{" "}
                {formatAed(intelligence.marketRangeHigh)}
              </p>
            </div>
            <div className="larssh-glass rounded-xl px-4 py-3">
              <p className="text-muted-foreground text-[11px] uppercase tracking-wide">
                Average Market Price
              </p>
              <p className="mt-1 text-sm font-semibold">
                {formatAed(intelligence.averageMarketPrice)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricTile
            icon={TrendingUp}
            label="ROI"
            value={formatPercent(intelligence.estimatedRoiPercent)}
          />
          <MetricTile
            icon={BarChart3}
            label="Price / sq.ft"
            value={
              intelligence.averagePricePerSqft
                ? formatAed(intelligence.averagePricePerSqft)
                : "—"
            }
          />
          <MetricTile
            icon={CircleDollarSign}
            label="Demand"
            value={
              intelligence.demand ? formatLabel(intelligence.demand) : "—"
            }
          />
          <MetricTile
            icon={Gauge}
            label="Confidence"
            value={
              intelligence.confidencePercent !== null
                ? `${formatNumber(intelligence.confidencePercent)}%`
                : "—"
            }
          />
        </div>

        <div className="larssh-glass flex flex-col justify-between rounded-2xl border border-gold/15 p-5">
          <div>
            <p className="text-muted-foreground text-[11px] uppercase tracking-[0.18em]">
              Recommendation
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {intelligence.recommendation ?? "Market review pending"}
            </p>
            {intelligence.differenceFromMarketLabel ? (
              <p className={cn("mt-2 text-sm font-medium", tone?.diff)}>
                {intelligence.differenceFromMarketLabel}
              </p>
            ) : null}
          </div>
          {intelligence.averageRent ? (
            <p className="text-muted-foreground mt-4 text-xs">
              Average rent benchmark: {formatAed(intelligence.averageRent)}/yr
              {intelligence.averageRentEstimated ? " · Estimated" : ""}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricTile
          icon={intelligence.differenceDirection === "below" ? ArrowDownRight : ArrowUpRight}
          label="Difference from Market"
          value={intelligence.differenceFromMarketLabel ?? "—"}
          valueClassName={tone?.diff}
        />
        <MetricTile
          icon={CircleDollarSign}
          label="Average Rent"
          value={
            intelligence.averageRent
              ? `${formatAed(intelligence.averageRent)}/yr${
                  intelligence.averageRentEstimated ? " · Est." : ""
                }`
              : "—"
          }
        />
        <MetricTile
          icon={BarChart3}
          label="Estimated Yield"
          value={formatPercent(intelligence.estimatedYieldPercent)}
        />
      </div>

      {intelligence.confidencePercent !== null ? (
        <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Gauge className="text-gold size-4" />
              <p className="text-sm font-medium">Market Confidence</p>
            </div>
            <p className="text-gold font-mono text-sm font-semibold">
              {formatNumber(intelligence.confidencePercent)}%
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="from-gold h-full rounded-full bg-gradient-to-r to-amber-300 transition-all duration-700"
              style={{ width: `${Math.min(intelligence.confidencePercent, 100)}%` }}
            />
          </div>
        </div>
      ) : null}

      {intelligence.profileNotes ? (
        <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
          {intelligence.profileNotes}
        </p>
      ) : null}
    </SectionCard>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="larssh-card-hover rounded-xl border border-white/5 p-4">
      <div className="flex items-center gap-2">
        <Icon className="text-gold size-4" />
        <p className="text-muted-foreground text-[11px] uppercase tracking-wide">
          {label}
        </p>
      </div>
      <p className={cn("mt-2 text-lg font-semibold tracking-tight", valueClassName)}>
        {value}
      </p>
    </div>
  );
}
