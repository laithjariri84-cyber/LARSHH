import type { ComponentType } from "react";
import {
  Bath,
  Bed,
  Building2,
  Car,
  Eye,
  Home,
  Maximize2,
  Sofa,
  Sun,
} from "lucide-react";

import type { PropertyDetailsViewModel } from "@/features/properties/types";
import { formatLabel, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

import { SectionCard } from "./section-card";

type PropertySummaryProps = {
  property: PropertyDetailsViewModel;
};

function resolveCompletionStatus(
  completionYear: number | null
): string {
  if (!completionYear) return "Ready";
  const currentYear = new Date().getFullYear();
  return completionYear > currentYear ? "Off-Plan" : "Ready";
}

export function PropertySummary({ property }: PropertySummaryProps) {
  const items = [
    {
      icon: Bed,
      label: "Bedrooms",
      value: property.bedrooms?.toString() ?? "—",
    },
    {
      icon: Bath,
      label: "Bathrooms",
      value: property.bathrooms?.toString() ?? "—",
    },
    {
      icon: Maximize2,
      label: "Size",
      value: property.size
        ? `${formatNumber(property.size)} sq ft`
        : "—",
    },
    {
      icon: Car,
      label: "Parking",
      value: "1 Space",
      placeholder: true,
    },
    {
      icon: Sun,
      label: "Balcony",
      value:
        property.bedrooms === 0 || property.bedrooms === 1
          ? "—"
          : "Yes",
      placeholder: property.bedrooms !== 0 && property.bedrooms !== 1,
    },
    {
      icon: Eye,
      label: "View",
      value: property.information.view
        ? formatLabel(property.information.view)
        : "—",
    },
    {
      icon: Sofa,
      label: "Furnished",
      value: property.information.furnishing
        ? formatLabel(property.information.furnishing)
        : "—",
    },
    {
      icon: Home,
      label: "Property Type",
      value: formatLabel(property.propertyType),
    },
    {
      icon: Building2,
      label: "Completion Status",
      value: resolveCompletionStatus(property.information.completionYear),
    },
  ];

  return (
    <SectionCard
      title="Property Summary"
      description="Key specifications at a glance"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-3">
        {items.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>
    </SectionCard>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  placeholder,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  placeholder?: boolean;
}) {
  return (
    <div className="larssh-glass larssh-card-hover group rounded-xl border border-white/5 p-4 transition-all duration-300 hover:border-gold/20">
      <div className="text-muted-foreground mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide">
        <span className="bg-gold/10 text-gold flex size-8 items-center justify-center rounded-lg transition-colors group-hover:bg-gold/15">
          <Icon className="size-4" />
        </span>
        {label}
      </div>
      <p
        className={cn(
          "text-lg font-semibold tracking-tight",
          value === "—" && "text-muted-foreground"
        )}
      >
        {value}
      </p>
      {placeholder ? (
        <p className="text-muted-foreground mt-1 text-[10px]">Estimated</p>
      ) : null}
    </div>
  );
}
