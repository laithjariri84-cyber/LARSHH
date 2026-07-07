"use client";

import Link from "next/link";
import { Bath, Bed, Building2, MapPin, Maximize2 } from "lucide-react";
import { ListingStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptimizedListingImage } from "@/components/ui/optimized-listing-image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { PropertySearchResult } from "@/features/search/types";
import { formatCurrency, formatLabel, formatNumber } from "@/lib/utils";

type PropertyQuickViewProps = {
  property: PropertySearchResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coverImage: string;
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

export function PropertyQuickView({
  property,
  open,
  onOpenChange,
  coverImage,
}: PropertyQuickViewProps) {
  const title = property.unitNumber
    ? `Unit ${property.unitNumber}`
    : property.building;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <div className="relative aspect-[16/10] overflow-hidden">
          <OptimizedListingImage src={coverImage} alt={title} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          {property.status ? (
            <Badge
              variant={statusVariant[property.status]}
              className="absolute top-4 left-4 backdrop-blur-md"
            >
              {formatLabel(property.status)}
            </Badge>
          ) : null}
        </div>

        <div className="space-y-6 p-6">
          <SheetHeader className="space-y-2 text-left">
            <p className="text-gold text-xs font-medium tracking-[0.2em] uppercase">
              {property.propertyCode}
            </p>
            <SheetTitle className="text-2xl">{title}</SheetTitle>
            <SheetDescription className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {property.community} · {property.building}
            </SheetDescription>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-4">
            <PriceBlock
              label="Asking Rent"
              value={formatCurrency(property.askingRent, property.currency)}
            />
            <PriceBlock
              label="Asking Sale"
              value={formatCurrency(property.askingSale, property.currency)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SpecBlock icon={Bed} label="Beds" value={property.bedrooms?.toString() ?? "—"} />
            <SpecBlock icon={Bath} label="Baths" value={property.bathrooms?.toString() ?? "—"} />
            <SpecBlock
              icon={Maximize2}
              label="Area"
              value={property.size ? `${formatNumber(property.size)} sq ft` : "—"}
            />
          </div>

          <div className="larssh-glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="text-gold size-4" />
              <span className="font-medium">{property.assignedAgent ?? "Unassigned"}</span>
            </div>
          </div>

          <Button asChild className="larssh-gold-btn larssh-press w-full">
            <Link href={`/properties/${property.propertyId}`}>View Full Details</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PriceBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="larssh-glass rounded-xl p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function SpecBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bed;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
      <Icon className="text-gold mx-auto size-4" />
      <p className="text-muted-foreground mt-2 text-[10px] uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
