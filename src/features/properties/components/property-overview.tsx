import type { PropertyDetailsViewModel } from "@/features/properties/types";
import { formatDateShort, formatLabel, formatNumber } from "@/lib/utils";
import { InfoGrid, InfoItem, SectionCard } from "./section-card";

type PropertyOverviewProps = {
  property: PropertyDetailsViewModel;
};

export function PropertyOverview({ property }: PropertyOverviewProps) {
  return (
    <SectionCard
      title="Property Overview"
      description="Imported listing and asset details from the database"
    >
      {property.marketingTitle ? (
        <p className="mb-6 text-base font-medium leading-relaxed">
          {property.marketingTitle}
        </p>
      ) : null}

      <InfoGrid columns={3}>
        <InfoItem label="Reference" value={property.propertyCode} />
        <InfoItem
          label="PF Expert Reference"
          value={property.pfExpertReference ?? "—"}
        />
        <InfoItem
          label="Property Type"
          value={formatLabel(property.propertyType)}
        />
        <InfoItem
          label="Rent / Sale"
          value={
            property.listingType ? formatLabel(property.listingType) : "—"
          }
        />
        <InfoItem label="Bedrooms" value={property.bedrooms ?? "—"} />
        <InfoItem label="Bathrooms" value={property.bathrooms ?? "—"} />
        <InfoItem
          label="Size"
          value={
            property.size ? `${formatNumber(property.size)} sq ft` : "—"
          }
        />
        <InfoItem label="Master Community" value={property.masterCommunity ?? "—"} />
        <InfoItem label="Community" value={property.community} />
        <InfoItem label="Building" value={property.building} />
        <InfoItem label="Unit Number" value={property.unitNumber ?? "—"} />
        <InfoItem
          label="Status"
          value={
            property.listingStatus
              ? formatLabel(property.listingStatus)
              : "—"
          }
        />
        <InfoItem
          label="Created"
          value={formatDateShort(property.createdAt)}
        />
        <InfoItem
          label="Updated"
          value={formatDateShort(property.updatedAt)}
        />
        {property.listingPublishedAt ? (
          <InfoItem
            label="Published"
            value={formatDateShort(property.listingPublishedAt)}
          />
        ) : null}
      </InfoGrid>
    </SectionCard>
  );
}
