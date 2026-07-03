import { cn } from "@/lib/utils";

type MarketConfidenceGaugeProps = {
  score: number;
};

export function MarketConfidenceGauge({ score }: MarketConfidenceGaugeProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="intelligence-terminal flex flex-col items-center justify-center rounded-2xl border border-gold/15 p-6 md:p-8">
      <p className="text-muted-foreground text-[11px] tracking-[0.22em] uppercase">
        Market Confidence
      </p>
      <div className="relative mt-6 size-40">
        <svg className="size-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="intelligence-ticker text-gold font-mono text-4xl font-semibold">
            {score}%
          </span>
          <span
            className={cn(
              "mt-1 text-[10px] tracking-wider uppercase",
              score >= 92 ? "text-emerald-400" : "text-amber-400"
            )}
          >
            {score >= 92 ? "High conviction" : "Moderate conviction"}
          </span>
        </div>
      </div>
      <p className="text-muted-foreground mt-6 max-w-sm text-center text-sm leading-7">
        Confidence reflects pricing alignment, comparable spread, demand velocity,
        and micro-market absorption in the selected scope.
      </p>
    </div>
  );
}
