"use client";

import Link from "next/link";
import {
  Calendar,
  Download,
  Mail,
  MessageSquare,
  Phone,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PropertyDetailsViewModel } from "@/features/properties/types";
import { notify } from "@/lib/notifications";
import { formatCurrency, formatLabel } from "@/lib/utils";

import { AssignedAgentCard } from "./assigned-agent-card";

type PropertyActionSidebarProps = {
  property: PropertyDetailsViewModel;
};

export function PropertyActionSidebar({ property }: PropertyActionSidebarProps) {
  const primaryPrice =
    property.pricing.askingSale != null
      ? formatCurrency(property.pricing.askingSale, property.pricing.currency)
      : property.pricing.askingRent != null
        ? `${formatCurrency(property.pricing.askingRent, property.pricing.currency)}/mo`
        : property.pricing.askingPrice != null
          ? formatCurrency(property.pricing.askingPrice, property.pricing.currency)
          : "Price on request";

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: property.propertyCode, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    notify.linkCopied();
  }

  return (
    <aside className="space-y-5 max-xl:static xl:sticky xl:top-20 xl:self-start">
      <div className="larssh-card animate-scale-in overflow-hidden rounded-2xl">
        <div className="border-b border-white/5 bg-gradient-to-br from-gold/10 via-transparent to-transparent px-6 py-5">
          <p className="larssh-label">Asking Price</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{primaryPrice}</p>
          {property.listingType ? (
            <p className="text-muted-foreground mt-1 text-sm">
              {formatLabel(property.listingType)} listing
            </p>
          ) : null}
        </div>

        <div className="space-y-3 p-5">
          <Button className="larssh-gold-btn larssh-press w-full" asChild>
            <Link href="/crm">
              <Calendar className="size-4" />
              Schedule Viewing
            </Link>
          </Button>
          <Button variant="outline" className="larssh-press w-full border-white/10" asChild>
            <a href={`mailto:?subject=${encodeURIComponent(property.propertyCode)}`}>
              <Mail className="size-4" />
              Email Inquiry
            </a>
          </Button>
          <Button
            variant="outline"
            className="larssh-press w-full border-white/10"
            onClick={() => void handleShare()}
          >
            <Share2 className="size-4" />
            Share Listing
          </Button>
          <Button variant="ghost" className="larssh-press w-full" asChild>
            <Link href="/search">
              <Download className="size-4" />
              Download Brochure
            </Link>
          </Button>
        </div>
      </div>

      <div className="larssh-glass grid grid-cols-2 gap-3 rounded-2xl p-4 max-lg:gap-2">
        <QuickAction icon={Phone} label="Call Agent" />
        <QuickAction icon={MessageSquare} label="Message" />
      </div>

      <AssignedAgentCard agent={property.agent} />
    </aside>
  );
}

function QuickAction({
  icon: Icon,
  label,
}: {
  icon: typeof Phone;
  label: string;
}) {
  return (
    <button
      type="button"
      className="larssh-press flex min-h-11 flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-4 text-center transition-colors hover:border-gold/20 hover:bg-gold-muted/20 max-lg:py-3"
      onClick={() => notify.info(label, "This action will be available in a future release.")}
    >
      <Icon className="text-gold size-4" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
