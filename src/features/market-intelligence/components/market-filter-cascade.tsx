"use client";

import { ChevronDown } from "lucide-react";

import {
  BEDROOM_OPTIONS,
  FILTER_STEPS,
  FURNISHING_OPTIONS,
  getBuildingsForCommunity,
  getCommunitiesForMaster,
  MASTER_COMMUNITY_NAMES,
  PROPERTY_TYPES,
  VIEW_OPTIONS,
} from "../data/filter-options";
import type { MarketFilters } from "../types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type MarketFilterCascadeProps = {
  filters: MarketFilters;
  onChange: (filters: MarketFilters) => void;
};

export function MarketFilterCascade({
  filters,
  onChange,
}: MarketFilterCascadeProps) {
  const communities = getCommunitiesForMaster(filters.masterCommunity);
  const buildings = getBuildingsForCommunity(filters.community);

  function updateFilter<K extends keyof MarketFilters>(
    key: K,
    value: MarketFilters[K]
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
    <div className="paragon-card animate-slide-up rounded-2xl p-5 md:p-6">
      <div className="mb-5">
        <p className="text-gold text-[11px] font-medium tracking-[0.2em] uppercase">
          Market Scope
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">
          Configure Intelligence Filters
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Narrow the market lens from master community down to view type.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {FILTER_STEPS.map((step, index) => (
          <div key={step.key} className="relative">
            {index < FILTER_STEPS.length - 1 ? (
              <ChevronDown className="text-muted-foreground/40 absolute -bottom-3 left-1/2 hidden size-4 -translate-x-1/2 rotate-[-90deg] xl:block" />
            ) : null}
            <FilterField
              label={step.label}
              value={filters[step.key]}
              onValueChange={(value) =>
                updateFilter(step.key, value as MarketFilters[typeof step.key])
              }
              options={getOptionsForStep(step.key, {
                communities,
                buildings,
              })}
              disabled={
                step.key === "community"
                  ? communities.length === 0
                  : step.key === "building"
                    ? buildings.length === 0
                    : false
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function getOptionsForStep(
  key: (typeof FILTER_STEPS)[number]["key"],
  context: { communities: string[]; buildings: string[] }
): readonly string[] {
  switch (key) {
    case "masterCommunity":
      return MASTER_COMMUNITY_NAMES;
    case "community":
      return context.communities;
    case "building":
      return context.buildings;
    case "propertyType":
      return PROPERTY_TYPES;
    case "bedrooms":
      return BEDROOM_OPTIONS;
    case "furnishing":
      return FURNISHING_OPTIONS;
    case "view":
      return VIEW_OPTIONS;
    default:
      return [];
  }
}

function FilterField({
  label,
  value,
  onValueChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly string[];
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground text-[11px] tracking-wider uppercase">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            "h-11 border-white/10 bg-card/50",
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
