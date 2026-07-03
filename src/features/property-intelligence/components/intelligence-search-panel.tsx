"use client";

import type { ReactNode } from "react";
import { Search, Sparkles } from "lucide-react";

import {
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  FURNISHING_OPTIONS,
  getBuildingsForCommunity,
  getCommunitiesForMaster,
  MASTER_COMMUNITY_NAMES,
  PROPERTY_TYPES,
  PURPOSE_OPTIONS,
  VIEW_OPTIONS,
} from "../data/filter-options";
import type { IntelligenceFilters } from "../types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type IntelligenceSearchPanelProps = {
  filters: IntelligenceFilters;
  onChange: (filters: IntelligenceFilters) => void;
  scopeLabel: string;
};

export function IntelligenceSearchPanel({
  filters,
  onChange,
  scopeLabel,
}: IntelligenceSearchPanelProps) {
  const communities = getCommunitiesForMaster(filters.masterCommunity);
  const buildings = getBuildingsForCommunity(filters.community);

  function update<K extends keyof IntelligenceFilters>(
    key: K,
    value: IntelligenceFilters[K]
  ) {
    const next = { ...filters, [key]: value };

    if (key === "masterCommunity") {
      const nextCommunities = getCommunitiesForMaster(value);
      next.community = nextCommunities[0] ?? "";
      next.building = getBuildingsForCommunity(next.community)[0] ?? "";
    }

    if (key === "community") {
      next.building = getBuildingsForCommunity(value)[0] ?? "";
    }

    onChange(next);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/15 bg-card/80 shadow-2xl shadow-gold/5 backdrop-blur-xl">
      <div className="absolute inset-0 intelligence-terminal opacity-60" />
      <div className="relative border-b border-gold/10 px-5 py-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="paragon-gold-gradient flex size-10 items-center justify-center rounded-xl shadow-lg shadow-gold/20">
              <Search className="text-gold-foreground size-4" />
            </div>
            <div>
              <p className="text-gold text-[11px] tracking-[0.25em] uppercase">
                Intelligence Search
              </p>
              <h2 className="text-lg font-semibold tracking-tight">
                Configure Property Scope
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-gold/20 bg-gold-muted/40 px-3 py-1.5">
            <Sparkles className="text-gold size-3.5" />
            <span className="text-xs font-medium">{scopeLabel}</span>
          </div>
        </div>
      </div>

      <div className="relative space-y-6 p-5 md:p-6">
        <FilterGroup title="Location">
          <FilterSelect
            label="Master Community"
            value={filters.masterCommunity}
            options={MASTER_COMMUNITY_NAMES}
            onChange={(value) => update("masterCommunity", value)}
          />
          <FilterSelect
            label="Community"
            value={filters.community}
            options={communities}
            onChange={(value) => update("community", value)}
          />
          <FilterSelect
            label="Building"
            value={filters.building}
            options={buildings}
            onChange={(value) => update("building", value)}
          />
        </FilterGroup>

        <FilterGroup title="Product">
          <FilterSelect
            label="Purpose"
            value={filters.purpose}
            options={PURPOSE_OPTIONS}
            onChange={(value) =>
              update("purpose", value as IntelligenceFilters["purpose"])
            }
          />
          <FilterSelect
            label="Property Type"
            value={filters.propertyType}
            options={PROPERTY_TYPES}
            onChange={(value) => update("propertyType", value)}
          />
          <FilterSelect
            label="Bedrooms"
            value={filters.bedrooms}
            options={BEDROOM_OPTIONS}
            onChange={(value) => update("bedrooms", value)}
          />
          <FilterSelect
            label="Bathrooms"
            value={filters.bathrooms}
            options={BATHROOM_OPTIONS}
            onChange={(value) => update("bathrooms", value)}
          />
        </FilterGroup>

        <FilterGroup title="Attributes">
          <FilterSelect
            label="Furnishing"
            value={filters.furnishing}
            options={FURNISHING_OPTIONS}
            onChange={(value) => update("furnishing", value)}
          />
          <FilterSelect
            label="View"
            value={filters.view}
            options={VIEW_OPTIONS}
            onChange={(value) => update("view", value)}
          />
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-muted-foreground text-[11px] tracking-wider uppercase">
              Size (sqft)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.sizeMin}
                onChange={(event) => update("sizeMin", event.target.value)}
                className="h-11 border-white/10 bg-black/30 font-mono"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.sizeMax}
                onChange={(event) => update("sizeMax", event.target.value)}
                className="h-11 border-white/10 bg-black/30 font-mono"
              />
            </div>
          </div>
        </FilterGroup>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-muted-foreground mb-3 text-[10px] tracking-[0.2em] uppercase">
        {title}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground text-[11px] tracking-wider uppercase">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "h-11 border-white/10 bg-black/30",
            value && "border-gold/20"
          )}
        >
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
