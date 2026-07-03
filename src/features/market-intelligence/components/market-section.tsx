import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MarketSectionProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function MarketSection({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
}: MarketSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon ? (
            <div className="bg-gold-muted text-gold flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Icon className="size-4" />
            </div>
          ) : null}
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="text-muted-foreground mt-1 text-sm">{description}</p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className="paragon-card rounded-2xl p-5 md:p-6">{children}</div>
    </section>
  );
}
