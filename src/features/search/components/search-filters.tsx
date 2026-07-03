"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  Furnishing,
  ListingStatus,
  ListingType,
  PropertyType,
  ViewType,
} from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SearchFiltersInput } from "@/features/search/schemas/search-filters.schema";
import type { FilterOption } from "@/features/search/types";
import { cn, formatLabel } from "@/lib/utils";

type SearchFiltersProps = {
  values: SearchFiltersInput;
  communities: FilterOption[];
  buildings: FilterOption[];
  highlightedFields?: string[];
};

const ALL = "__all__";

function enumOptions<T extends string>(values: T[]) {
  return values.map((v) => ({ value: v, label: formatLabel(v) }));
}

export function SearchFilters({
  values,
  communities,
  buildings,
  highlightedFields = [],
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === ALL) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if ("communityId" in updates && !updates.communityId) {
        params.delete("buildingId");
      }

      startTransition(() => {
        router.push(`/search?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  function clearFilters() {
    startTransition(() => {
      router.push("/search");
    });
  }

  const hasActiveFilters = searchParams.toString().length > 0;
  const isHighlighted = (key: string) => highlightedFields.includes(key);

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <Search className="text-muted-foreground size-4" />
          <h2 className="text-sm font-semibold">Search Filters</h2>
          {isPending ? (
            <span className="text-muted-foreground text-xs">Updating…</span>
          ) : null}
        </div>
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={isPending}
          >
            <X className="size-4" />
            Clear all
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2 md:p-6 lg:grid-cols-3 xl:grid-cols-4">
        <FilterSelect
          label="Offering Type"
          value={values.listingType ?? ALL}
          onValueChange={(v) => updateParams({ listingType: v === ALL ? undefined : v })}
          options={enumOptions(Object.values(ListingType))}
          disabled={isPending}
          highlighted={isHighlighted("listingType")}
        />

        <FilterSelect
          label="Community"
          value={values.communityId ?? ALL}
          onValueChange={(v) => updateParams({ communityId: v === ALL ? undefined : v, buildingId: undefined })}
          options={communities}
          disabled={isPending}
          highlighted={isHighlighted("communityId")}
        />

        <FilterSelect
          label="Building"
          value={values.buildingId ?? ALL}
          onValueChange={(v) => updateParams({ buildingId: v === ALL ? undefined : v })}
          options={buildings}
          disabled={isPending || !values.communityId}
          placeholder={values.communityId ? "All buildings" : "Select community first"}
          highlighted={isHighlighted("buildingId")}
        />

        <FilterSelect
          label="Property Type"
          value={values.propertyType ?? ALL}
          onValueChange={(v) => updateParams({ propertyType: v === ALL ? undefined : v })}
          options={enumOptions(Object.values(PropertyType))}
          disabled={isPending}
          highlighted={isHighlighted("propertyType")}
        />

        <FilterSelect
          label="Bedrooms"
          value={values.bedrooms?.toString() ?? ALL}
          onValueChange={(v) => updateParams({ bedrooms: v === ALL ? undefined : v })}
          options={[0, 1, 2, 3, 4, 5, 6].map((n) => ({
            value: String(n),
            label: n === 0 ? "Studio" : String(n),
          }))}
          disabled={isPending}
          highlighted={isHighlighted("bedrooms")}
        />

        <FilterSelect
          label="Bathrooms"
          value={values.bathrooms?.toString() ?? ALL}
          onValueChange={(v) => updateParams({ bathrooms: v === ALL ? undefined : v })}
          options={[1, 1.5, 2, 2.5, 3, 3.5, 4].map((n) => ({
            value: String(n),
            label: String(n),
          }))}
          disabled={isPending}
          highlighted={isHighlighted("bathrooms")}
        />

        <FilterSelect
          label="Furnishing"
          value={values.furnishing ?? ALL}
          onValueChange={(v) => updateParams({ furnishing: v === ALL ? undefined : v })}
          options={enumOptions(Object.values(Furnishing))}
          disabled={isPending}
          highlighted={isHighlighted("furnishing")}
        />

        <FilterSelect
          label="View"
          value={values.view ?? ALL}
          onValueChange={(v) => updateParams({ view: v === ALL ? undefined : v })}
          options={enumOptions(Object.values(ViewType))}
          disabled={isPending}
          highlighted={isHighlighted("view")}
        />

        <FilterSelect
          label="Status"
          value={values.status ?? ALL}
          onValueChange={(v) => updateParams({ status: v === ALL ? undefined : v })}
          options={enumOptions(Object.values(ListingStatus))}
          disabled={isPending}
          highlighted={isHighlighted("status")}
        />

        <FilterNumber
          label="Min Price"
          value={values.minPrice}
          onChange={(v) => updateParams({ minPrice: v })}
          disabled={isPending}
          placeholder="0"
          highlighted={isHighlighted("minPrice")}
        />

        <FilterNumber
          label="Max Price"
          value={values.maxPrice}
          onChange={(v) => updateParams({ maxPrice: v })}
          disabled={isPending}
          placeholder="Any"
          highlighted={isHighlighted("maxPrice")}
        />

        <FilterNumber
          label="Min Size (sq ft)"
          value={values.minSize}
          onChange={(v) => updateParams({ minSize: v })}
          disabled={isPending}
          placeholder="0"
          highlighted={isHighlighted("minSize")}
        />

        <FilterNumber
          label="Max Size (sq ft)"
          value={values.maxSize}
          onChange={(v) => updateParams({ maxSize: v })}
          disabled={isPending}
          placeholder="Any"
          highlighted={isHighlighted("maxSize")}
        />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
  disabled,
  placeholder = "All",
  highlighted = false,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: FilterOption[];
  disabled?: boolean;
  placeholder?: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl p-1 transition-colors",
        highlighted && "bg-gold-muted/15 ring-1 ring-gold/30"
      )}
    >
      <Label className={cn("text-xs font-medium", highlighted && "text-gold")}>
        {label}
        {highlighted ? " · AI" : ""}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{placeholder}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function FilterNumber({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  highlighted = false,
}: {
  label: string;
  value?: number;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl p-1 transition-colors",
        highlighted && "bg-gold-muted/15 ring-1 ring-gold/30"
      )}
    >
      <Label className={cn("text-xs font-medium", highlighted && "text-gold")}>
        {label}
        {highlighted ? " · AI" : ""}
      </Label>
      <Input
        type="number"
        min={0}
        placeholder={placeholder}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value || undefined)}
      />
    </div>
  );
}
