import type { ComponentType } from "react";
import {
  Car,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  Trees,
  Waves,
  Wifi,
} from "lucide-react";

import type { PropertyDetailsViewModel } from "@/features/properties/types";
import { formatLabel } from "@/lib/utils";

import { SectionCard } from "./section-card";

type PropertyAmenitiesProps = {
  property: PropertyDetailsViewModel;
};

type AmenityItem = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  description: string;
};

function buildAmenities(property: PropertyDetailsViewModel): AmenityItem[] {
  const base: AmenityItem[] = [
    {
      icon: Waves,
      label: "Swimming Pool",
      description: "Community pool access",
    },
    {
      icon: Dumbbell,
      label: "Fitness Centre",
      description: "Fully equipped gym",
    },
    {
      icon: Car,
      label: "Covered Parking",
      description: "Dedicated parking bay",
    },
    {
      icon: ShieldCheck,
      label: "24/7 Security",
      description: "Concierge & CCTV",
    },
    {
      icon: Wifi,
      label: "High-Speed Internet",
      description: "Building-ready connectivity",
    },
    {
      icon: Trees,
      label: "Landscaped Gardens",
      description: "Shared outdoor spaces",
    },
  ];

  if (property.information.view) {
    base.unshift({
      icon: Sparkles,
      label: `${formatLabel(property.information.view)} View`,
      description: "Premium outlook from unit",
    });
  }

  return base.slice(0, 8);
}

export function PropertyAmenities({ property }: PropertyAmenitiesProps) {
  const amenities = buildAmenities(property);

  return (
    <SectionCard
      title="Amenities"
      description="Community and building features for this listing"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {amenities.map((amenity) => (
          <div
            key={amenity.label}
            className="larssh-card-hover flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-gold/20"
          >
            <span className="bg-gold/10 text-gold flex size-10 shrink-0 items-center justify-center rounded-xl">
              <amenity.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{amenity.label}</p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                {amenity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
