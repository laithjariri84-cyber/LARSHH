"use client";

import Link from "next/link";
import { Calendar, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PropertyDetailsViewModel } from "@/features/properties/types";
import { formatCurrency } from "@/lib/utils";

type PropertyMobileActionBarProps = {
  property: PropertyDetailsViewModel;
};

export function PropertyMobileActionBar({
  property,
}: PropertyMobileActionBarProps) {
  const primaryPrice =
    property.pricing.askingSale != null
      ? formatCurrency(property.pricing.askingSale, property.pricing.currency)
      : property.pricing.askingRent != null
        ? `${formatCurrency(property.pricing.askingRent, property.pricing.currency)}/mo`
        : property.pricing.askingPrice != null
          ? formatCurrency(property.pricing.askingPrice, property.pricing.currency)
          : "Price on request";

  return (
    <>
      <div
        className="fixed right-0 bottom-0 left-0 z-40 border-t border-white/10 bg-background/95 p-4 backdrop-blur-xl xl:hidden"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
              Asking Price
            </p>
            <p className="truncate text-base font-semibold">{primaryPrice}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 border-white/10"
            aria-label="Call agent"
          >
            <Phone className="size-4" />
          </Button>
          <Button className="larssh-gold-btn larssh-press min-w-[140px] shrink-0" asChild>
            <Link href="/crm">
              <Calendar className="size-4" />
              View
            </Link>
          </Button>
        </div>
      </div>
      <div aria-hidden className="h-24 xl:hidden" />
    </>
  );
}
