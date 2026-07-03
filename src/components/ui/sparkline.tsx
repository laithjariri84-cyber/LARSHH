import { cn } from "@/lib/utils";

type SparklineProps = {
  data?: number[];
  className?: string;
  trend?: "up" | "down" | "neutral";
};

const DEFAULT_DATA = [12, 18, 14, 22, 19, 26, 24, 30, 28, 34];

export function Sparkline({
  data = DEFAULT_DATA,
  className,
  trend = "up",
}: SparklineProps) {
  const width = 80;
  const height = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const strokeColor =
    trend === "up"
      ? "rgba(52, 211, 153, 0.9)"
      : trend === "down"
        ? "rgba(248, 113, 113, 0.9)"
        : "rgba(212, 175, 55, 0.7)";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-7 w-20 opacity-80", className)}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
