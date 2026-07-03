import type { PricePosition } from "../data/mock-listings-search";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const config: Record<
  PricePosition,
  { label: string; className: string }
> = {
  under_market: {
    label: "Under Market",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  market_price: {
    label: "Market Price",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  },
  overpriced: {
    label: "Overpriced",
    className: "border-red-500/30 bg-red-500/10 text-red-400",
  },
};

export function PricePositionBadge({
  position,
  className,
}: {
  position: PricePosition;
  className?: string;
}) {
  const item = config[position];
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-semibold tracking-wide uppercase", item.className, className)}
    >
      {item.label}
    </Badge>
  );
}

export function formatListingPrice(value: number, purpose: "Sale" | "Rent") {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

  return purpose === "Rent" ? `${formatted}/yr` : formatted;
}

export function formatDifference(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)}`;
}
