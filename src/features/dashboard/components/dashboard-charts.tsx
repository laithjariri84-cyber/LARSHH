import type { ChartPoint } from "../data/mock-dashboard";

type ListingTrendChartProps = {
  data: ChartPoint[];
  title: string;
  subtitle?: string;
};

export function ListingTrendChart({
  data,
  title,
  subtitle,
}: ListingTrendChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const width = 100;
  const height = 48;

  const points = data
    .map((d, i) => {
      const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
      const y = height - ((d.value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="paragon-card rounded-2xl p-5">
      <div className="mb-6">
        <h3 className="font-semibold tracking-tight">{title}</h3>
        {subtitle ? (
          <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
        ) : null}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-32 w-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="goldLine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill="url(#goldLine)"
        />
        <polyline
          points={points}
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="text-muted-foreground mt-2 flex flex-wrap justify-between gap-x-1 gap-y-1 text-[9px] uppercase tracking-wider max-lg:text-[9px] lg:text-[10px]">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

type MarketMixChartProps = {
  data: ChartPoint[];
  title: string;
};

export function MarketMixChart({ data, title }: MarketMixChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const colors = ["#D4AF37", "#8B7355"];

  return (
    <div className="paragon-card rounded-2xl p-5">
      <h3 className="mb-6 font-semibold tracking-tight">{title}</h3>
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center">
        <div
          className="relative size-28 shrink-0 rounded-full"
          style={{
            background: `conic-gradient(${data
              .map((d, i) => {
                const start = data
                  .slice(0, i)
                  .reduce((s, x) => s + (x.value / total) * 100, 0);
                const end = start + (d.value / total) * 100;
                return `${colors[i]} ${start}% ${end}%`;
              })
              .join(", ")})`,
          }}
        >
          <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-card text-center">
            <span className="text-lg font-semibold">{total}</span>
            <span className="text-muted-foreground text-[10px]">Total</span>
          </div>
        </div>
        <div className="space-y-3">
          {data.map((d, i) => (
            <div key={d.label} className="flex items-center gap-3">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: colors[i] }}
              />
              <div>
                <p className="text-sm font-medium">{d.label}</p>
                <p className="text-muted-foreground text-xs">
                  {d.value} · {Math.round((d.value / total) * 100)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type PriceIndexChartProps = {
  data: ChartPoint[];
  title: string;
};

export function PriceIndexChart({ data, title }: PriceIndexChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="paragon-card rounded-2xl p-5">
      <h3 className="mb-6 font-semibold tracking-tight">{title}</h3>
      <div className="flex h-32 items-end gap-2">
        {data.map((d, i) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-gold/20 to-gold transition-all duration-500 hover:from-gold/30 hover:to-gold/90"
              style={{
                height: `${(d.value / max) * 100}%`,
                animationDelay: `${i * 80}ms`,
              }}
            />
            <span className="text-muted-foreground text-[9px] max-lg:text-[8px] lg:text-[10px]">{d.label}</span>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground mt-4 text-xs">
        Average sale asking price · millions AED
      </p>
    </div>
  );
}
