import { ShieldCheck, ShieldQuestion, TrendingDown, TrendingUp } from "lucide-react";

import type { MarketScore, MarketScoreLevel } from "../types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SCORE_CONFIG: Record<
  MarketScoreLevel,
  {
    label: string;
    className: string;
    icon: typeof TrendingUp;
  }
> = {
  excellent_investment: {
    label: "Excellent Investment",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    icon: TrendingUp,
  },
  good_investment: {
    label: "Good Investment",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    icon: ShieldCheck,
  },
  average: {
    label: "Average",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    icon: ShieldQuestion,
  },
  overpriced_area: {
    label: "Overpriced Area",
    className: "border-red-500/30 bg-red-500/10 text-red-400",
    icon: TrendingDown,
  },
};

type MarketScorePanelProps = {
  score: MarketScore;
};

export function MarketScorePanel({ score }: MarketScorePanelProps) {
  const active = SCORE_CONFIG[score.level];
  const Icon = active.icon;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-center gap-3">
          <MarketScoreBadge level={score.level} />
          <Badge variant="outline" className="border-gold/20 text-gold">
            Score {score.score}/100
          </Badge>
        </div>
        <div className="mt-5 flex items-start gap-4">
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-2xl",
              active.className
            )}
          >
            <Icon className="size-6" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">{score.headline}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-7">
              {score.rationale}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {(Object.keys(SCORE_CONFIG) as MarketScoreLevel[]).map((level) => (
          <div
            key={level}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3",
              level === score.level
                ? "border-gold/25 bg-gold-muted/30"
                : "border-white/5 bg-white/[0.02]"
            )}
          >
            <MarketScoreBadge level={level} />
            <span className="text-muted-foreground text-xs">
              {level === score.level ? "Current signal" : "Benchmark tier"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MarketScoreBadge({ level }: { level: MarketScoreLevel }) {
  const config = SCORE_CONFIG[level];
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-semibold tracking-wide uppercase", config.className)}
    >
      {config.label}
    </Badge>
  );
}
