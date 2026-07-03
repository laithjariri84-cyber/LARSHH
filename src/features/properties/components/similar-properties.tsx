import Link from "next/link";

import { ArrowRight, Building2 } from "lucide-react";

import { ListingStatus } from "@prisma/client";



import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import type { SimilarPropertySummary } from "@/features/properties/types";

import { getPropertyCardImage } from "@/lib/property-placeholder-image";

import { formatCurrency, formatLabel, formatNumber } from "@/lib/utils";

import { SectionCard } from "./section-card";

import { SimilarPropertiesEmptyState } from "./empty-state";



type SimilarPropertiesProps = {

  properties: SimilarPropertySummary[];

  community: string;

};



const statusVariant: Record<

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



export function SimilarProperties({

  properties,

  community,

}: SimilarPropertiesProps) {

  return (

    <SectionCard

      title="Similar Properties"

      description={`Same community · same property type · similar bedrooms · price ±20% in ${community}`}

      action={

        <Button variant="ghost" size="sm" className="larssh-press" asChild>

          <Link href="/search">

            View all

            <ArrowRight className="size-4" />

          </Link>

        </Button>

      }

    >

      {properties.length === 0 ? (

        <SimilarPropertiesEmptyState />

      ) : (

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          {properties.map((property) => (

            <Link

              key={property.propertyId}

              href={`/properties/${property.propertyId}`}

              className="larssh-card larssh-card-hover group overflow-hidden rounded-2xl transition-all"

            >

              <div className="relative aspect-[16/10] overflow-hidden">

                {/* eslint-disable-next-line @next/next/no-img-element */}

                <img

                  src={getPropertyCardImage(property.propertyId)}

                  alt={property.building}

                  loading="lazy"

                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"

                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                {property.status ? (

                  <Badge

                    variant={statusVariant[property.status]}

                    className="absolute top-3 left-3 backdrop-blur-md"

                  >

                    {formatLabel(property.status)}

                  </Badge>

                ) : null}

              </div>



              <div className="space-y-3 p-4">

                <div>

                  <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">

                    {property.community}

                  </p>

                  <p className="mt-1 text-sm font-semibold group-hover:text-gold">

                    {property.building}

                  </p>

                </div>



                <div className="text-muted-foreground flex items-center gap-2 text-xs">

                  <Building2 className="size-3.5" />

                  {property.bedrooms ?? "—"} bed ·{" "}

                  {property.size ? `${formatNumber(property.size)} sq ft` : "—"}

                </div>



                <div className="grid grid-cols-2 gap-2 text-xs">

                  <div>

                    <p className="text-muted-foreground">Rent</p>

                    <p className="font-semibold">

                      {formatCurrency(property.askingRent, property.currency)}

                    </p>

                  </div>

                  <div>

                    <p className="text-muted-foreground">Sale</p>

                    <p className="font-semibold">

                      {formatCurrency(property.askingSale, property.currency)}

                    </p>

                  </div>

                </div>

              </div>

            </Link>

          ))}

        </div>

      )}

    </SectionCard>

  );

}

