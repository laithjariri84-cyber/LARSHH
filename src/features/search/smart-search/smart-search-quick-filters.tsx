"use client";

import { cn } from "@/lib/utils";

export const SMART_SEARCH_QUICK_FILTERS = [
  { label: "Lowest AED/sqft", query: "lowest price per sqft" },
  { label: "Highest ROI", query: "highest ROI" },
  { label: "Best Value", query: "best value" },
  { label: "Newest", query: "newest listings" },
  { label: "Lowest Price", query: "lowest price" },
  { label: "Highest Price", query: "highest price" },
  { label: "Luxury", query: "luxury" },
  { label: "Investment", query: "best investment" },
] as const;

type SmartSearchQuickFiltersProps = {
  onSelect: (query: string) => void;
  disabled?: boolean;
};

export function SmartSearchQuickFilters({
  onSelect,
  disabled = false,
}: SmartSearchQuickFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SMART_SEARCH_QUICK_FILTERS.map((item) => (
        <button
          key={item.label}
          type="button"
          disabled={disabled}
          className={cn(
            "rounded-full border border-gold/20 bg-gold/[0.06] px-3 py-1.5 text-xs font-medium text-gold transition-colors",
            "hover:border-gold/40 hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-50"
          )}
          onClick={() => onSelect(item.query)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
