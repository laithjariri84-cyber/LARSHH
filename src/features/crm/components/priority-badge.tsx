import type { LeadPriority } from "../types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CONFIG: Record<
  LeadPriority,
  { label: string; className: string }
> = {
  high: {
    label: "High",
    className: "border-red-500/30 bg-red-500/10 text-red-400",
  },
  medium: {
    label: "Medium",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  low: {
    label: "Low",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: LeadPriority;
  className?: string;
}) {
  const item = CONFIG[priority];
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-semibold tracking-wide uppercase", item.className, className)}
    >
      {item.label}
    </Badge>
  );
}
