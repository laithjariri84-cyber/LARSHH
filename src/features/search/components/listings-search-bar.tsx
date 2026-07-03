"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ListingsSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  onToggleFilters?: () => void;
  filtersVisible?: boolean;
};

export function ListingsSearchBar({
  value,
  onChange,
  resultCount,
  onToggleFilters,
  filtersVisible,
}: ListingsSearchBarProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="text-gold pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by community, owner, agent, property code..."
          className={cn(
            "h-14 rounded-2xl border-white/10 bg-card/70 pl-12 text-base shadow-lg shadow-black/20 backdrop-blur-md",
            "placeholder:text-muted-foreground/70 focus-visible:border-gold/40 focus-visible:ring-gold/20"
          )}
        />
        {onToggleFilters ? (
          <button
            type="button"
            onClick={onToggleFilters}
            className={cn(
              "absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
              filtersVisible
                ? "bg-gold-muted text-gold"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <SlidersHorizontal className="size-3.5" />
            Filters
          </button>
        ) : null}
      </div>
      <p className="text-muted-foreground text-sm">
        <span className="text-foreground font-medium">{resultCount}</span> listings
        found · Enterprise search preview
      </p>
    </div>
  );
}
