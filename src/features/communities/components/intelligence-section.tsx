import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type IntelligenceSectionProps = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
};

export function IntelligenceSection({
  id,
  title,
  description,
  icon: Icon,
  children,
  className,
}: IntelligenceSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "paragon-card scroll-mt-28 rounded-2xl p-5 md:p-6",
        className
      )}
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="bg-gold-muted text-gold flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Icon className="size-4" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
