import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { PropertyDetailsViewModel } from "@/features/properties/types";
import { PropertyGallerySection } from "@/features/properties/components/gallery";

import { MarketIntelligenceCard } from "./market-intelligence-card";
import { MarketIntelligenceUnavailable } from "./market-intelligence-unavailable";
import { PropertyActionSidebar } from "./property-action-sidebar";
import { PropertyAgentCard } from "./property-agent-card";
import { PropertyAmenities } from "./property-amenities";
import { PropertyDescription } from "./property-description";
import { PropertyDocuments } from "./property-documents";
import { PropertyHero } from "./property-hero";
import { PropertyInformation } from "./property-information";
import { PropertyInternalNotes } from "./property-internal-notes";
import { PropertyLocation } from "./property-location";
import { PropertyMedia } from "./property-media";
import { PropertyMobileActionBar } from "./property-mobile-action-bar";
import { PropertyOverview } from "./property-overview";
import { PropertyPricing } from "./property-pricing";
import { PropertySummary } from "./property-summary";
import { PropertyTimeline } from "./property-timeline";
import { SimilarProperties } from "./similar-properties";

type PropertyDetailsViewProps = {
  property: PropertyDetailsViewModel;
};

function buildGalleryTitle(property: PropertyDetailsViewModel): string {
  const unit = property.unitNumber
    ? `Unit ${property.unitNumber}`
    : property.building;
  return `${unit} · ${property.community}`;
}

export function PropertyDetailsView({ property }: PropertyDetailsViewProps) {
  return (
    <div className="larssh-page animate-page-enter space-y-6 max-lg:space-y-5 md:space-y-8">
      <Button variant="ghost" size="sm" className="larssh-press w-fit" asChild>
        <Link href="/search">
          <ArrowLeft className="size-4" />
          Back to search
        </Link>
      </Button>

      <PropertyHero property={property} />

      <div className="w-full max-lg:-mx-0">
        <PropertyGallerySection
          initialPhotos={property.photos}
          propertyId={property.id}
          propertyTitle={buildGalleryTitle(property)}
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <aside className="order-1 space-y-5 xl:order-2 xl:sticky xl:top-20 xl:self-start">
          <PropertyAgentCard agent={property.agent} />
          <PropertyActionSidebar property={property} />
        </aside>

        <div className="order-2 space-y-6 max-lg:space-y-5 xl:order-1">
          <PropertySummary property={property} />

          {property.marketIntelligence ? (
            <MarketIntelligenceCard intelligence={property.marketIntelligence} />
          ) : (
            <MarketIntelligenceUnavailable />
          )}

          <PropertyDescription description={property.description} />
          <PropertyAmenities property={property} />
          <PropertyLocation property={property} />
          <PropertyDocuments />
          <PropertyInternalNotes notes={property.internalNotes} />

          <PropertyOverview property={property} />
          <PropertyPricing property={property} />
          <PropertyInformation information={property.information} />
          <PropertyMedia floorPlans={property.floorPlans} />
          <PropertyTimeline events={property.timeline} />
        </div>
      </div>

      <SimilarProperties
        properties={property.similarProperties}
        community={property.community}
      />

      <PropertyMobileActionBar property={property} />
    </div>
  );
}
