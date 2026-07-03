import type { TrendPoint } from "../types";
import { cn } from "@/lib/utils";

type MarketTrendChartProps = {
  data: TrendPoint[];
  title: string;
  valuePrefix?: string;
  accent?: "gold" | "sky";
};

export function MarketTrendChart({
  data,
  title,
  valuePrefix = "$",
  accent = "gold",
}: MarketTrendChartProps) {
  const max = Math.max(...data.map((point) => point.value));
  const min = Math.min(...data.map((point) => point.value));
  const range = max - min || 1;
  const width = 100;
  const height = 52;

  const points = data
    .map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.value - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  const stroke = accent === "gold" ? "#D4AF37" : "#38bdf8";
  const gradientId = `${title.replace(/\s+/g, "-").toLowerCase()}-trend`;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-muted-foreground mt-1 text-xs">Trailing 12 months</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
            Latest
          </p>
          <p className="text-lg font-semibold">
            {valuePrefix}
            {data[data.length - 1]?.value.toLocaleString()}
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#${gradientId})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * width;
          const y = height - ((point.value - min) / range) * (height - 6) - 3;
          return (
            <circle
              key={point.label}
              cx={x}
              cy={y}
              r="1.4"
              fill={stroke}
              className="opacity-80"
            />
          );
        })}
      </svg>

      <div className="text-muted-foreground grid grid-cols-6 gap-2 text-[10px] uppercase tracking-wider md:grid-cols-12">
        {data.map((point) => (
          <span key={point.label} className="text-center">
            {point.label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs md:grid-cols-6">
        {data.slice(-6).map((point) => (
          <div
            key={`${point.label}-value`}
            className={cn(
              "rounded-lg border px-2 py-2 text-center",
              accent === "gold"
                ? "border-gold/10 bg-gold-muted/20"
                : "border-sky-500/10 bg-sky-500/5"
            )}
          >
            <p className="text-muted-foreground text-[10px]">{point.label}</p>
            <p className="mt-1 font-medium">
              {valuePrefix}
              {point.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
