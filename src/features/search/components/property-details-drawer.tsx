"use client";

import type { ReactNode } from "react";
import {
  Bath,
  Bed,
  Building2,
  FileText,
  Maximize2,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ListingSearchRecord } from "../data/mock-listings-search";
import {
  formatDifference,
  formatListingPrice,
  PricePositionBadge,
} from "./price-position-badge";
import { cn } from "@/lib/utils";

type PropertyDetailsDrawerProps = {
  listing: ListingSearchRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PropertyDetailsDrawer({
  listing,
  open,
  onOpenChange,
}: PropertyDetailsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl">
        {listing ? (
          <>
            <div
              className={cn(
                "relative -mx-0 -mt-0 mb-0 flex h-56 items-end bg-gradient-to-br p-6",
                listing.imageGradient
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
              <div className="relative z-10 w-full">
                <PricePositionBadge position={listing.pricePosition} />
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  {listing.propertyCode}
                </h2>
                <p className="text-white/80 mt-1 text-sm">{listing.community}</p>
              </div>
            </div>

            <div className="space-y-6 p-6 pt-4">
              <SheetHeader className="space-y-0 border-0 p-0">
                <SheetTitle className="sr-only">{listing.propertyCode}</SheetTitle>
                <SheetDescription className="sr-only">
                  Property details for {listing.propertyCode}
                </SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  label="Price"
                  value={formatListingPrice(listing.price, listing.purpose)}
                  highlight
                />
                <MetricCard
                  label="Market Price"
                  value={formatListingPrice(listing.marketPrice, listing.purpose)}
                />
                <MetricCard
                  label="Difference"
                  value={formatDifference(listing.difference)}
                  tone={
                    listing.difference < 0
                      ? "positive"
                      : listing.difference > 0
                        ? "negative"
                        : "neutral"
                  }
                />
                <MetricCard label="Purpose" value={listing.purpose} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={User} label="Agent" value={listing.agent} />
                <InfoCard icon={Users} label="Owner" value={listing.owner} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <MiniStat
                  icon={Bed}
                  label="Bedrooms"
                  value={
                    listing.bedrooms === 0 ? "Studio" : String(listing.bedrooms)
                  }
                />
                <MiniStat
                  icon={Bath}
                  label="Bathrooms"
                  value={String(listing.bathrooms)}
                />
                <MiniStat
                  icon={Maximize2}
                  label="Size"
                  value={`${listing.size.toLocaleString()} sqft`}
                />
              </div>

              <Section title="Description" icon={Building2}>
                <p className="text-muted-foreground text-sm leading-7">
                  {listing.description}
                </p>
              </Section>

              <Section title="Amenities" icon={Sparkles}>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((item) => (
                    <Badge
                      key={item}
                      variant="outline"
                      className="border-white/10 bg-white/[0.03] text-xs"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </Section>

              <Section title="Notes" icon={FileText}>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-sm leading-7">{listing.notes}</p>
                </div>
              </Section>

              <div className="flex flex-wrap gap-2 pb-4">
                <Badge variant="outline" className="border-white/10">
                  {listing.propertyType}
                </Badge>
                <Badge variant="outline" className="border-white/10">
                  Furnished: {listing.furnished}
                </Badge>
                <Badge variant="outline" className="border-white/10">
                  {listing.status}
                </Badge>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function MetricCard({
  label,
  value,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "positive" | "negative" | "neutral";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        highlight
          ? "border-gold/20 bg-gold-muted"
          : "border-white/5 bg-white/[0.02]"
      )}
    >
      <p className="text-muted-foreground text-[11px] tracking-wider uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-lg font-semibold tracking-tight",
          tone === "positive" && "text-emerald-400",
          tone === "negative" && "text-red-400",
          tone === "neutral" && "text-sky-400"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="text-gold flex items-center gap-2 text-[11px] tracking-wider uppercase">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}

function MiniStat({
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
      <p className="text-muted-foreground mt-2 text-[10px] uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Building2;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="text-gold size-4" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <Separator className="mb-4 bg-white/5" />
      {children}
    </div>
  );
}
