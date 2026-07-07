import type { DistributionBucket } from "../types";
import { cn } from "@/lib/utils";

type PriceDistributionChartProps = {
  data: DistributionBucket[];
};

export function PriceDistributionChart({ data }: PriceDistributionChartProps) {
  const maxCount = Math.max(...data.map((bucket) => bucket.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex h-56 items-end gap-3 md:gap-4">
        {data.map((bucket, index) => (
          <div key={bucket.label} className="flex min-w-0 flex-1 flex-col items-center gap-3">
            <div className="relative flex h-full w-full items-end">
              <div
                className={cn(
                  "w-full rounded-t-xl bg-gradient-to-t transition-all duration-700",
                  index === data.findIndex((item) => item.count === maxCount)
                    ? "from-gold/30 to-gold shadow-lg shadow-gold/10"
                    : "from-muted/50 to-muted hover:from-gold/20 hover:to-gold/40"
                )}
                style={{
                  height: `${Math.max((bucket.count / maxCount) * 100, bucket.count > 0 ? 12 : 4)}%`,
                  animationDelay: `${index * 80}ms`,
                }}
              />
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold">
                {bucket.count}
              </span>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-[10px] leading-4">{bucket.label}</p>
              <p className="text-gold mt-1 text-[10px] font-medium">{bucket.percentage}%</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-2 md:grid-cols-5">
        {data.map((bucket) => (
          <div
            key={`${bucket.label}-legend`}
            className="border-border bg-muted/40 rounded-lg border px-3 py-2 text-center"
          >
            <p className="text-muted-foreground text-[10px]">{bucket.label}</p>
            <p className="mt-1 text-sm font-medium">
              {bucket.count} listings · {bucket.percentage}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
