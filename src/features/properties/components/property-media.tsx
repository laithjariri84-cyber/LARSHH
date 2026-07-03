import type { PropertyDetailsViewModel } from "@/features/properties/types";

import { SectionCard } from "./section-card";

type PropertyMediaProps = {
  floorPlans: PropertyDetailsViewModel["floorPlans"];
};

export function PropertyMedia({ floorPlans }: PropertyMediaProps) {
  if (floorPlans.length === 0) {
    return (
      <SectionCard title="Floor plans" description="Architectural layouts and plans">
        <p className="text-muted-foreground text-sm">
          No floor plans uploaded for this property yet.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Floor plans" description="Architectural layouts and plans">
      <div className="grid gap-4 sm:grid-cols-2">
        {floorPlans.map((plan) => (
          <a
            key={plan.id}
            href={plan.url}
            target="_blank"
            rel="noopener noreferrer"
            className="paragon-card hover:border-gold/25 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:text-gold"
          >
            {plan.title ?? "View floor plan"}
          </a>
        ))}
      </div>
    </SectionCard>
  );
}
