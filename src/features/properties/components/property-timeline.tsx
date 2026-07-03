import {
  CircleDot,
  Clock3,
  DollarSign,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import type { PropertyTimelineEvent } from "@/features/properties/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { SectionCard } from "./section-card";
import { TimelineEmptyState } from "./empty-state";

type PropertyTimelineProps = {
  events: PropertyTimelineEvent[];
};

const eventStyles: Record<
  PropertyTimelineEvent["type"],
  { icon: typeof Sparkles; color: string }
> = {
  created: { icon: Sparkles, color: "bg-emerald-500/10 text-emerald-700" },
  updated: { icon: RefreshCw, color: "bg-blue-500/10 text-blue-700" },
  price_changed: { icon: DollarSign, color: "bg-amber-500/10 text-amber-700" },
  status_changed: { icon: CircleDot, color: "bg-violet-500/10 text-violet-700" },
};

export function PropertyTimeline({ events }: PropertyTimelineProps) {
  return (
    <SectionCard
      title="Property Timeline"
      description="Lifecycle events derived from property and listing records"
    >
      {events.length === 0 ? (
        <TimelineEmptyState />
      ) : (
        <ol className="space-y-0">
          {events.map((event, index) => {
            const style = eventStyles[event.type];
            const Icon = style.icon;

            return (
              <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                {index < events.length - 1 ? (
                  <span className="bg-border absolute top-10 left-4 h-[calc(100%-1rem)] w-px" />
                ) : null}
                <div
                  className={cn(
                    "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
                    style.color
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold">{event.label}</p>
                    <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                      <Clock3 className="size-3.5" />
                      {formatDate(event.occurredAt)}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {event.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </SectionCard>
  );
}
