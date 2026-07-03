import {
  CalendarCheck,
  DollarSign,
  Handshake,
  Phone,
  Send,
  Wallet,
} from "lucide-react";

import type { CrmStats } from "../types";
import { formatCurrency } from "../lib/formatters";
import { cn } from "@/lib/utils";

type CrmStatsCardsProps = {
  stats: CrmStats;
};

const METRICS = [
  { key: "todaysCalls", label: "Today's Calls", icon: Phone, format: (v: number) => String(v) },
  { key: "todaysViewings", label: "Today's Viewings", icon: CalendarCheck, format: (v: number) => String(v) },
  { key: "offersSent", label: "Offers Sent", icon: Send, format: (v: number) => String(v) },
  { key: "dealsClosed", label: "Deals Closed", icon: Handshake, format: (v: number) => String(v) },
  { key: "revenue", label: "Revenue", icon: DollarSign, format: formatCurrency },
  { key: "commission", label: "Commission", icon: Wallet, format: formatCurrency },
] as const;

export function CrmStatsCards({ stats }: CrmStatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {METRICS.map((metric, index) => {
        const Icon = metric.icon;
        const value = stats[metric.key];

        return (
          <div
            key={metric.key}
            className={cn(
              "paragon-card animate-slide-up rounded-2xl p-4 transition-all hover:border-gold/20",
              index === 0 && "border-gold/15"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="bg-gold-muted text-gold flex size-9 items-center justify-center rounded-xl">
                <Icon className="size-4" />
              </div>
            </div>
            <p className="text-muted-foreground mt-4 text-xs">{metric.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {metric.format(value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
