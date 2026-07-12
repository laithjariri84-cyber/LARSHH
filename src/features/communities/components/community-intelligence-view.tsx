"use client";

import {
  BarChart3,
  BedDouble,
  Building2,
  ClipboardList,
  DollarSign,
  FileText,
  GraduationCap,
  Hotel,
  Layers3,
  MapPin,
  Percent,
  Ruler,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
  Waves,
} from "lucide-react";

import { INTELLIGENCE_SECTIONS } from "../data/intelligence-sections";
import { buildMarketMetricsFromSummary } from "../lib/market-metrics";
import type {
  CommunityIntelligence,
  IntelligenceSectionKey,
  MasterCommunity,
  ResidentialProject,
} from "../types";
import type { CommunityMarketSummary } from "@/lib/market-intelligence/summary";

import { CommunityIntelligenceHero } from "./community-intelligence-hero";
import { IntelligenceMetricsRow } from "./intelligence-metrics-row";
import { IntelligenceSection } from "./intelligence-section";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SECTION_ICONS: Record<IntelligenceSectionKey, typeof Building2> = {
  overview: Sparkles,
  buildings: Building2,
  unitTypes: BedDouble,
  unitSizes: Ruler,
  activeListings: ClipboardList,
  averageRent: DollarSign,
  averageSale: DollarSign,
  roi: Percent,
  pricePerSqft: BarChart3,
  marketTrends: TrendingUp,
  lifestyle: Sparkles,
  nearbySchools: GraduationCap,
  nearbyHotels: Hotel,
  nearbyRestaurants: UtensilsCrossed,
  nearbyBeaches: Waves,
  notes: FileText,
};

type CommunityIntelligenceViewProps = {
  master: MasterCommunity;
  project: ResidentialProject;
  marketSummary: CommunityMarketSummary | null;
};

export function CommunityIntelligenceView({
  master,
  project,
  marketSummary,
}: CommunityIntelligenceViewProps) {
  const marketMetrics = buildMarketMetricsFromSummary(marketSummary);
  const intelligence: CommunityIntelligence = {
    ...project.intelligence,
    averageRent: marketMetrics.averageRent,
    averageSale: marketMetrics.averageSale,
    roi: marketMetrics.roi,
    pricePerSqft: marketMetrics.pricePerSqft,
  };

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <CommunityIntelligenceHero master={master} project={project} />

      <IntelligenceMetricsRow
        metrics={[
          {
            label: "Active Listings",
            value: String(intelligence.activeListings.length),
            hint: "Indexed listing references",
          },
          intelligence.averageRent,
          intelligence.averageSale,
          intelligence.roi,
        ]}
      />

      <div className="grid gap-8 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <nav className="paragon-card sticky top-24 rounded-2xl p-4">
            <p className="text-muted-foreground mb-3 text-[11px] tracking-wider uppercase">
              Intelligence Sections
            </p>
            <div className="space-y-1">
              {INTELLIGENCE_SECTIONS.map((section) => (
                <a
                  key={section.key}
                  href={`#${section.key}`}
                  className="text-muted-foreground hover:text-gold block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </nav>
        </aside>

        <div className="space-y-5">
          {INTELLIGENCE_SECTIONS.map((section) => (
            <IntelligenceSection
              key={section.key}
              id={section.key}
              title={section.title}
              description={section.description}
              icon={SECTION_ICONS[section.key]}
            >
              <SectionContent sectionKey={section.key} intelligence={intelligence} />
            </IntelligenceSection>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionContent({
  sectionKey,
  intelligence,
}: {
  sectionKey: IntelligenceSectionKey;
  intelligence: CommunityIntelligence;
}) {
  switch (sectionKey) {
    case "overview":
      return (
        <p className="text-muted-foreground text-sm leading-8">
          {intelligence.overview}
        </p>
      );

    case "buildings":
    case "unitTypes":
    case "unitSizes":
    case "activeListings":
    case "nearbySchools":
    case "nearbyHotels":
    case "nearbyRestaurants":
    case "nearbyBeaches":
      return (
        <ItemGrid
          items={intelligence[sectionKey]}
          emptyLabel="No records indexed yet."
        />
      );

    case "averageRent":
    case "averageSale":
    case "roi":
    case "pricePerSqft":
      return <MetricPanel metric={intelligence[sectionKey]} highlighted />;

    case "marketTrends":
    case "lifestyle":
      return <BulletPanel items={intelligence[sectionKey]} />;

    case "notes":
      return (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-sm leading-8">{intelligence.notes}</p>
        </div>
      );

    default:
      return null;
  }
}

function ItemGrid({
  items,
  emptyLabel,
}: {
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    meta?: string;
  }>;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <PlaceholderBlock label={emptyLabel} />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-gold/15"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{item.title}</p>
              {item.subtitle ? (
                <p className="text-muted-foreground mt-1 text-sm">{item.subtitle}</p>
              ) : null}
            </div>
            {item.meta ? (
              <Badge variant="outline" className="border-white/10 text-[10px] shrink-0">
                {item.meta}
              </Badge>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricPanel({
  metric,
  highlighted,
}: {
  metric: { label: string; value: string; hint?: string };
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5",
        highlighted ? "border-gold/20 bg-gold-muted/30" : "border-white/5 bg-white/[0.02]"
      )}
    >
      <p className="text-muted-foreground text-[11px] tracking-wider uppercase">
        {metric.label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{metric.value}</p>
      {metric.hint ? (
        <p className="text-muted-foreground mt-3 text-sm leading-7">{metric.hint}</p>
      ) : null}
    </div>
  );
}

function BulletPanel({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm leading-7"
        >
          <MapPin className="text-gold mt-1 size-4 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PlaceholderBlock({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
      <Layers3 className="text-muted-foreground mx-auto size-6" />
      <p className="text-muted-foreground mt-3 text-sm">{label}</p>
    </div>
  );
}
