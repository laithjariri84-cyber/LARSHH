import { Bath, Bed, Building2, Home, Maximize2, MapPin } from "lucide-react";

import { ListingStatus } from "@prisma/client";



import { Badge } from "@/components/ui/badge";

import type { PropertyDetailsViewModel } from "@/features/properties/types";

import { formatLabel, formatNumber } from "@/lib/utils";

import { cn } from "@/lib/utils";



type PropertyHeaderProps = {

  property: PropertyDetailsViewModel;

};



const listingStatusVariant: Record<

  ListingStatus,

  "default" | "secondary" | "destructive" | "outline" | "success" | "warning"

> = {

  DRAFT: "outline",

  ACTIVE: "success",

  PENDING: "warning",

  SOLD: "secondary",

  RENTED: "secondary",

  WITHDRAWN: "outline",

  EXPIRED: "destructive",

};



export function PropertyHeader({ property }: PropertyHeaderProps) {

  const statusLabel = property.listingStatus

    ? formatLabel(property.listingStatus)

    : "No active listing";



  const statusVariant = property.listingStatus

    ? listingStatusVariant[property.listingStatus]

    : "outline";



  return (

    <div className="larssh-card animate-scale-in relative overflow-hidden rounded-2xl">

      <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_50%)]" />



      <div className="relative p-6 md:p-8">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          <div className="space-y-4">

            <div className="flex flex-wrap items-center gap-2">

              <Badge variant="outline" className="border-gold/20 bg-gold-muted/30 text-gold">

                {property.propertyCode}

              </Badge>

              {property.listingType ? (

                <Badge variant="secondary">{formatLabel(property.listingType)}</Badge>

              ) : null}

            </div>



            <div>

              <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium tracking-wide uppercase">

                <span className="inline-flex items-center gap-1.5">

                  <MapPin className="text-gold size-3.5" />

                  {property.community}

                </span>

                <span className="hidden sm:inline">·</span>

                <span className="inline-flex items-center gap-1.5">

                  <Building2 className="text-gold size-3.5" />

                  {property.building}

                </span>

              </div>

              <h1 className="larssh-heading-xl mt-3">

                {property.unitNumber

                  ? `Unit ${property.unitNumber}`

                  : property.building}

              </h1>

              <p className="text-muted-foreground mt-2 text-sm md:text-base">

                {formatLabel(property.propertyType)} in {property.community}

              </p>

            </div>

          </div>



          <Badge variant={statusVariant} className="h-fit px-4 py-1.5">

            {statusLabel}

          </Badge>

        </div>



        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">

          <StatCard

            icon={Bed}

            label="Bedrooms"

            value={property.bedrooms?.toString() ?? "—"}

          />

          <StatCard

            icon={Bath}

            label="Bathrooms"

            value={property.bathrooms?.toString() ?? "—"}

          />

          <StatCard

            icon={Maximize2}

            label="Area"

            value={

              property.size ? `${formatNumber(property.size)} sq ft` : "—"

            }

          />

          <StatCard

            icon={Home}

            label="Type"

            value={formatLabel(property.propertyType)}

          />

        </div>

      </div>

    </div>

  );

}



function StatCard({

  icon: Icon,

  label,

  value,

}: {

  icon: typeof Bed;

  label: string;

  value: string;

}) {

  return (

    <div className="larssh-glass larssh-card-hover rounded-xl p-4 transition-all">

      <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium">

        <Icon className="text-gold size-3.5" />

        {label}

      </div>

      <p className={cn("text-lg font-semibold tracking-tight", value === "—" && "text-muted-foreground")}>

        {value}

      </p>

    </div>

  );

}

