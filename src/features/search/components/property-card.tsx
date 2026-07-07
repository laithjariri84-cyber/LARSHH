"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useState } from "react";
import {
  Bath,
  Bed,
  Building2,
  Eye,
  Heart,
  MapPin,
  Maximize2,
  Share2,
} from "lucide-react";
import { ListingStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptimizedListingImage } from "@/components/ui/optimized-listing-image";
import type { PropertySearchResult } from "@/features/search/types";
import { notify } from "@/lib/notifications";
import { getPropertyCardImage } from "@/lib/property-placeholder-image";
import { formatCurrency, formatLabel, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

import { PropertyQuickView } from "./property-quick-view";

type PropertyCardProps = {
  property: PropertySearchResult;
  index?: number;
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

function getPrimaryPrice(property: PropertySearchResult): string {
  if (property.listingType === "RENT" && property.askingRent) {
    return `${formatCurrency(property.askingRent, property.currency)}/mo`;
  }
  if (property.askingSale) {
    return formatCurrency(property.askingSale, property.currency);
  }
  if (property.askingRent) {
    return `${formatCurrency(property.askingRent, property.currency)}/mo`;
  }
  return "Price on request";
}

export const PropertyCard = memo(function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const coverImage = getPropertyCardImage(property.propertyId);
  const title = property.unitNumber
    ? `${property.building} · Unit ${property.unitNumber}`
    : property.building;

  useEffect(() => {
    const stored = localStorage.getItem(`larssh-fav-${property.propertyId}`);
    setIsFavorite(stored === "true");
  }, [property.propertyId]);

  const toggleFavorite = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const next = !isFavorite;
      setIsFavorite(next);
      localStorage.setItem(`larssh-fav-${property.propertyId}`, String(next));
      if (next) {
        notify.addedToFavorites(title);
      } else {
        notify.removedFromFavorites(title);
      }
    },
    [isFavorite, property.propertyId, title]
  );

  const handleShare = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const url = `${window.location.origin}/properties/${property.propertyId}`;
      if (navigator.share) {
        try {
          await navigator.share({ title, url });
          return;
        } catch {
          /* cancelled */
        }
      }
      await navigator.clipboard.writeText(url);
      notify.linkCopied();
    },
    [property.propertyId, title]
  );

  return (
    <>
      <article
        className="larssh-card larssh-card-hover group animate-slide-up overflow-hidden rounded-2xl"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <OptimizedListingImage
            src={coverImage}
            alt={title}
            priority={index < 2}
            className="transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {property.status ? (
              <Badge variant={statusVariant[property.status]} className="backdrop-blur-md">
                {formatLabel(property.status)}
              </Badge>
            ) : null}
          </div>

          <div className="absolute top-3 right-3 flex gap-1.5">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="larssh-press size-9 border border-white/10 bg-black/50 text-white backdrop-blur-md hover:bg-black/70 hover:text-gold"
              onClick={toggleFavorite}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={cn("size-4", isFavorite && "fill-gold text-gold")} />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="larssh-press size-9 border border-white/10 bg-black/50 text-white backdrop-blur-md hover:bg-black/70 hover:text-gold"
              onClick={handleShare}
              aria-label="Share property"
            >
              <Share2 className="size-4" />
            </Button>
          </div>

          <div className="absolute right-3 bottom-3 left-3">
            <p className="text-gold text-[10px] font-medium tracking-[0.2em] uppercase">
              {property.propertyCode}
            </p>
            <p className="mt-1 text-xl font-semibold text-white drop-shadow-md">
              {getPrimaryPrice(property)}
            </p>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{property.community}</span>
            </div>
            <h3 className="mt-1.5 text-base font-semibold tracking-tight">
              <Link
                href={`/properties/${property.propertyId}`}
                className="transition-colors hover:text-gold"
              >
                {title}
              </Link>
            </h3>
            <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
              <Building2 className="size-3.5 shrink-0" />
              {property.building}
            </div>
          </div>

          <div className="text-muted-foreground flex flex-wrap gap-3 text-sm">
            {property.bedrooms !== null ? (
              <span className="flex items-center gap-1.5">
                <Bed className="size-3.5" />
                {property.bedrooms} bed
              </span>
            ) : null}
            {property.bathrooms !== null ? (
              <span className="flex items-center gap-1.5">
                <Bath className="size-3.5" />
                {property.bathrooms} bath
              </span>
            ) : null}
            {property.size !== null ? (
              <span className="flex items-center gap-1.5">
                <Maximize2 className="size-3.5" />
                {formatNumber(property.size)} sq ft
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
            <span className="text-muted-foreground truncate text-xs">
              {property.assignedAgent ?? "Unassigned"}
            </span>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="larssh-press h-8 rounded-lg border-white/10 bg-white/5 text-xs"
                onClick={() => setQuickViewOpen(true)}
              >
                <Eye className="size-3.5" />
                Quick View
              </Button>
              <Button
                asChild
                size="sm"
                className="larssh-gold-btn larssh-press h-8 rounded-lg text-xs"
              >
                <Link href={`/properties/${property.propertyId}`}>Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </article>

      <PropertyQuickView
        property={property}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
        coverImage={coverImage}
      />
    </>
  );
});
