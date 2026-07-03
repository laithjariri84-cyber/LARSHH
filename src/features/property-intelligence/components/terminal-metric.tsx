import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type TerminalMetricProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
  mono?: boolean;
  className?: string;
};

export function TerminalMetric({
  label,
  value,
  hint,
  accent,
  mono = true,
  className,
}: TerminalMetricProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        accent
          ? "border-gold/25 bg-gold-muted/30"
          : "border-white/5 bg-black/20",
        className
      )}
    >
      <p className="text-muted-foreground text-[10px] tracking-[0.18em] uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-xl font-semibold tracking-tight md:text-2xl",
          mono && "intelligence-ticker font-mono",
          accent && "text-gold"
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="text-muted-foreground mt-2 text-[11px] leading-5">{hint}</p>
      ) : null}
    </div>
  );
}

export function TerminalSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3">
        <div className="bg-gold h-4 w-1 rounded-full" />
        <h2 className="text-sm font-semibold tracking-[0.2em] uppercase">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export function TerminalDivider() {
  return <div className="h-px bg-gradient-to-r from-gold/40 via-white/10 to-transparent" />;
}
