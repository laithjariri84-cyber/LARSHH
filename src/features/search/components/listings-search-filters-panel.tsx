"use client";

import {
  COMMUNITIES,
  FURNISHED_OPTIONS,
  PROPERTY_TYPES,
  PURPOSES,
  STATUS_OPTIONS,
} from "../data/mock-listings-search";
import type { ListingsSearchFilters } from "../lib/filter-listings";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ListingsSearchFiltersPanelProps = {
  filters: ListingsSearchFilters;
  onChange: (filters: ListingsSearchFilters) => void;
  onReset: () => void;
  className?: string;
};

const ALL = "__all__";

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly string[] | string[];
}) {
  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
        {label}
      </Label>
      <Select value={value || ALL} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 border-white/10 bg-card/50">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ListingsSearchFiltersPanel({
  filters,
  onChange,
  onReset,
  className,
}: ListingsSearchFiltersPanelProps) {
  function setField<K extends keyof ListingsSearchFilters>(
    key: K,
    value: string
  ) {
    onChange({
      ...filters,
      [key]: value === ALL ? "" : value,
    });
  }

  return (
    <div
      className={cn(
        "paragon-card animate-slide-up rounded-2xl p-5 md:p-6",
        className
      )}
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Filters</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Refine listings like a CRM workspace
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:text-gold"
        >
          Reset
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <FilterSelect
          label="Community"
          value={filters.community}
          onValueChange={(v) => setField("community", v)}
          options={COMMUNITIES}
        />
        <FilterSelect
          label="Purpose"
          value={filters.purpose}
          onValueChange={(v) => setField("purpose", v)}
          options={PURPOSES}
        />
        <FilterSelect
          label="Property Type"
          value={filters.propertyType}
          onValueChange={(v) => setField("propertyType", v)}
          options={PROPERTY_TYPES}
        />
        <FilterSelect
          label="Bedrooms"
          value={filters.bedrooms}
          onValueChange={(v) => setField("bedrooms", v)}
          options={["0", "1", "2", "3", "4", "5"]}
        />
        <FilterSelect
          label="Bathrooms"
          value={filters.bathrooms}
          onValueChange={(v) => setField("bathrooms", v)}
          options={["1", "2", "3", "4", "5", "6"]}
        />
        <FilterSelect
          label="Furnished"
          value={filters.furnished}
          onValueChange={(v) => setField("furnished", v)}
          options={FURNISHED_OPTIONS}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          onValueChange={(v) => setField("status", v)}
          options={STATUS_OPTIONS}
        />

        <div className="space-y-2 sm:col-span-2">
          <Label className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
            Price Range
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => setField("minPrice", e.target.value)}
              className="h-10 border-white/10 bg-card/50"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => setField("maxPrice", e.target.value)}
              className="h-10 border-white/10 bg-card/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
