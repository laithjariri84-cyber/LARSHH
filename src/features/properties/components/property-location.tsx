import { Building2, MapPin, Navigation } from "lucide-react";

import type { PropertyDetailsViewModel } from "@/features/properties/types";

import { SectionCard } from "./section-card";

type PropertyLocationProps = {
  property: PropertyDetailsViewModel;
};

const NEARBY_LANDMARKS = [
  "Dubai Marina Walk · 5 min",
  "Metro Station · 8 min",
  "Beach Access · 10 min",
  "Shopping Mall · 12 min",
];

export function PropertyLocation({ property }: PropertyLocationProps) {
  return (
    <SectionCard
      title="Location"
      description="Community context and neighbourhood highlights"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <LocationRow
            icon={MapPin}
            label="Community"
            value={property.community}
          />
          <LocationRow
            icon={Building2}
            label="Building"
            value={property.building}
          />
          {property.masterCommunity ? (
            <LocationRow
              icon={Navigation}
              label="Master Community"
              value={property.masterCommunity}
            />
          ) : null}

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="larssh-label">Nearby Landmarks</p>
            <ul className="mt-3 space-y-2">
              {NEARBY_LANDMARKS.map((landmark) => (
                <li
                  key={landmark}
                  className="text-muted-foreground flex items-center gap-2 text-sm"
                >
                  <span className="bg-gold size-1.5 shrink-0 rounded-full" />
                  {landmark}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-3 text-[11px]">
              Placeholder travel times · verified distances coming soon
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-black to-zinc-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08),transparent_70%)]" />
          <div className="relative flex aspect-[4/3] flex-col items-center justify-center p-8 text-center">
            <div className="bg-gold/10 text-gold mb-4 flex size-14 items-center justify-center rounded-2xl">
              <MapPin className="size-6" />
            </div>
            <p className="text-sm font-semibold">Google Maps</p>
            <p className="text-muted-foreground mt-2 max-w-xs text-xs leading-relaxed">
              Interactive map integration for {property.community} will appear
              here in a future release.
            </p>
            <div className="mt-6 grid w-full max-w-xs grid-cols-3 gap-2 opacity-40">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="h-8 rounded-md border border-white/10 bg-white/5"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function LocationRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="larssh-glass flex items-center gap-3 rounded-xl px-4 py-3">
      <Icon className="text-gold size-4 shrink-0" />
      <div>
        <p className="larssh-label">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
