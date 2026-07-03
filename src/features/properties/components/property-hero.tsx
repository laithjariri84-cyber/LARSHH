"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Copy,
  Download,
  Heart,
  MapPin,
  Printer,
  Share2,
} from "lucide-react";
import { ListingStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PropertyDetailsViewModel } from "@/features/properties/types";
import { notify } from "@/lib/notifications";
import { cn, formatCurrency, formatLabel } from "@/lib/utils";

type PropertyHeroProps = {
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

function buildHeroTitle(property: PropertyDetailsViewModel): string {
  if (property.marketingTitle?.trim()) return property.marketingTitle.trim();
  if (property.unitNumber) return `Unit ${property.unitNumber}`;
  return property.building;
}

function buildHeroPrice(property: PropertyDetailsViewModel): string {
  const { pricing, listingType } = property;

  if (listingType === "RENT" && pricing.askingRent != null) {
    return `${formatCurrency(pricing.askingRent, pricing.currency)}/yr`;
  }

  if (listingType === "SALE" && pricing.askingSale != null) {
    return formatCurrency(pricing.askingSale, pricing.currency);
  }

  if (pricing.askingPrice != null) {
    return formatCurrency(pricing.askingPrice, pricing.currency);
  }

  return "Price on request";
}

export function PropertyHero({ property }: PropertyHeroProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const favoriteKey = `larssh:favorite:${property.id}`;

  useEffect(() => {
    setIsFavorite(localStorage.getItem(favoriteKey) === "true");
  }, [favoriteKey]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const title = buildHeroTitle(property);
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
  }, [property]);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    notify.linkCopied();
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleFavorite = useCallback(() => {
    const next = !isFavorite;
    setIsFavorite(next);
    localStorage.setItem(favoriteKey, String(next));
    if (next) {
      notify.addedToFavorites(buildHeroTitle(property));
    } else {
      notify.removedFromFavorites(buildHeroTitle(property));
    }
  }, [favoriteKey, isFavorite, property]);

  const statusLabel = property.listingStatus
    ? formatLabel(property.listingStatus)
    : "No active listing";
  const statusVariant = property.listingStatus
    ? listingStatusVariant[property.listingStatus]
    : "outline";

  const reference =
    property.pfExpertReference?.trim() || property.propertyCode;

  return (
    <header className="larssh-card animate-scale-in relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-gold/12 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.1),transparent_55%)]" />

      <div className="relative p-6 md:p-8 lg:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 flex-1 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-gold/25 bg-gold-muted/20 text-gold"
              >
                Ref {reference}
              </Badge>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
              {property.listingType ? (
                <Badge variant="secondary">
                  {formatLabel(property.listingType)}
                </Badge>
              ) : null}
            </div>

            <div>
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium tracking-[0.14em] uppercase">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="text-gold size-3.5" />
                  {property.community}
                </span>
                <span className="hidden sm:inline text-white/20">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="text-gold size-3.5" />
                  {property.building}
                </span>
              </div>

              <h1 className="larssh-heading-xl mt-4 max-w-4xl text-balance">
                {buildHeroTitle(property)}
              </h1>

              <p className="text-muted-foreground mt-3 text-sm md:text-base">
                {formatLabel(property.propertyType)} · {property.community}
                {property.unitNumber ? ` · Unit ${property.unitNumber}` : ""}
              </p>
            </div>
          </div>

          <div className="shrink-0 space-y-4 xl:text-right">
            <div>
              <p className="larssh-label">Asking Price</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {buildHeroPrice(property)}
              </p>
              {property.listingType ? (
                <p className="text-muted-foreground mt-2 text-sm">
                  {formatLabel(property.listingType)} · AED
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/5 pt-6 max-lg:grid max-lg:grid-cols-2 max-lg:gap-2">
          <HeroAction icon={Share2} label="Share" onClick={() => void handleShare()} />
          <HeroAction icon={Copy} label="Copy Link" onClick={() => void handleCopyLink()} />
          <HeroAction
            icon={Download}
            label="Download Brochure"
            onClick={() =>
              notify.info(
                "Download Brochure",
                "Brochure generation will be available in a future release."
              )
            }
          />
          <HeroAction icon={Printer} label="Print" onClick={handlePrint} />
          <HeroAction
            icon={Heart}
            label={isFavorite ? "Saved" : "Favorite"}
            active={isFavorite}
            onClick={handleFavorite}
          />
        </div>
      </div>
    </header>
  );
}

function HeroAction({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: typeof Share2;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "larssh-press border-white/10 bg-black/20 backdrop-blur-sm hover:border-gold/30 hover:text-gold max-lg:w-full max-lg:justify-center",
        active && "border-gold/40 bg-gold-muted/20 text-gold"
      )}
      onClick={onClick}
    >
      <Icon className={cn("size-4", active && "fill-current")} />
      {label}
    </Button>
  );
}
