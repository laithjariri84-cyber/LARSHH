import type { IntelligenceMetric } from "../types";
import { cn } from "@/lib/utils";

type IntelligenceMetricsRowProps = {
  metrics: IntelligenceMetric[];
};

export function IntelligenceMetricsRow({ metrics }: IntelligenceMetricsRowProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={cn(
            "paragon-card animate-slide-up rounded-2xl p-5",
            index === 0 && "border-gold/20 bg-gold-muted/40"
          )}
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <p className="text-muted-foreground text-[11px] tracking-wider uppercase">
            {metric.label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{metric.value}</p>
          {metric.hint ? (
            <p className="text-muted-foreground mt-2 text-xs leading-6">{metric.hint}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
