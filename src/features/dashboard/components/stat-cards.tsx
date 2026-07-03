"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Home,
  Key,
  Landmark,
  Minus,
} from "lucide-react";

import { Sparkline } from "@/components/ui/sparkline";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import type { DashboardStat } from "@/server/dashboard";
import { cn } from "@/lib/utils";

const icons = [Home, Key, Landmark, Building2] as const;

type StatCardsProps = {
  stats: DashboardStat[];
};

function StatCard({ stat, index }: { stat: DashboardStat; index: number }) {
  const Icon = icons[index] ?? Home;
  const animatedValue = useAnimatedCounter(stat.value);
  const TrendIcon =
    stat.trend === "up"
      ? ArrowUpRight
      : stat.trend === "down"
        ? ArrowDownRight
        : Minus;

  return (
    <div
      className="larssh-card larssh-card-hover group animate-slide-up rounded-2xl p-6"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="paragon-gold-gradient flex size-11 items-center justify-center rounded-xl shadow-lg shadow-gold/10 transition-transform duration-300 group-hover:scale-105">
          <Icon className="text-gold-foreground size-5" />
        </div>
        <Sparkline trend={stat.trend} />
      </div>

      <p className="text-muted-foreground mt-5 text-sm">{stat.label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
        {animatedValue}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
            stat.trend === "up" && "bg-emerald-500/10 text-emerald-400",
            stat.trend === "down" && "bg-red-500/10 text-red-400",
            stat.trend === "neutral" && "bg-white/5 text-muted-foreground"
          )}
        >
          <TrendIcon className="size-3" />
          {stat.change}
        </span>
        <span className="text-muted-foreground text-[11px]">vs last period</span>
      </div>
    </div>
  );
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} stat={stat} index={index} />
      ))}
    </div>
  );
}
