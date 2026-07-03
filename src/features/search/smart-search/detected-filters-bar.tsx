"use client";

import { Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DetectedFilter } from "./smart-search.types";

type DetectedFiltersBarProps = {
  detected: DetectedFilter[];
  onClear?: () => void;
};

export function DetectedFiltersBar({
  detected,
  onClear,
}: DetectedFiltersBarProps) {
  if (detected.length === 0) return null;

  return (
    <div className="larssh-glass animate-slide-up rounded-xl border border-gold/20 bg-gold-muted/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gold inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="size-3.5" />
            LARSSH detected
          </span>
          {detected.map((item) => (
            <Badge
              key={`${item.key}-${item.chip ?? item.value}`}
              variant="outline"
              className="border-gold/30 bg-gold-muted/20 px-2.5 py-1 text-xs font-semibold tracking-wide text-white uppercase"
            >
              {item.chip ?? item.value}
            </Badge>
          ))}
        </div>
        {onClear ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-gold h-8"
            onClick={onClear}
          >
            <X className="size-4" />
            Clear smart search
          </Button>
        ) : null}
      </div>
    </div>
  );
}
