"use client";

import {
  Copy,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PropertyAgentInfo } from "@/features/properties/types";
import { notify } from "@/lib/notifications";
import { getInitials } from "@/lib/utils";

import { SectionCard } from "./section-card";

const DEFAULT_AGENT = {
  fullName: "Allaith Aljariri",
  title: "Managing Director",
  email: "info@larssh.ae",
  phone: "+971 50 000 0000",
  whatsapp: "971500000000",
  agencyName: "LARSSH",
} as const;

type PropertyAgentCardProps = {
  agent: PropertyAgentInfo | null;
};

export function PropertyAgentCard({ agent }: PropertyAgentCardProps) {
  const display = {
    fullName: agent?.fullName ?? DEFAULT_AGENT.fullName,
    title: DEFAULT_AGENT.title,
    email: agent?.email ?? DEFAULT_AGENT.email,
    phone: agent?.phone ?? DEFAULT_AGENT.phone,
    whatsapp: (agent?.phone ?? DEFAULT_AGENT.phone).replace(/\D/g, "") || DEFAULT_AGENT.whatsapp,
    agencyName: agent?.agencyName ?? DEFAULT_AGENT.agencyName,
    licenseNumber: agent?.licenseNumber,
  };

  async function copyPhone() {
    await navigator.clipboard.writeText(display.phone);
    notify.success("Phone copied", "Phone number copied to clipboard.");
  }

  return (
    <SectionCard
      title="Your Agent"
      description="Dedicated support for this listing"
      className="border-gold/10"
    >
      <div className="flex flex-col items-center text-center">
        <div className="paragon-gold-gradient flex size-20 items-center justify-center rounded-2xl text-xl font-semibold shadow-lg shadow-gold/10">
          <span className="text-gold-foreground">
            {getInitials(display.fullName)}
          </span>
        </div>

        <p className="mt-4 text-lg font-semibold">{display.fullName}</p>
        <p className="text-gold mt-1 text-sm font-medium">{display.title}</p>
        <p className="text-muted-foreground mt-1 text-sm">{display.agencyName}</p>

        {display.licenseNumber ? (
          <div className="text-muted-foreground mt-3 inline-flex items-center gap-1.5 text-xs">
            <ShieldCheck className="text-gold size-3.5" />
            License {display.licenseNumber}
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-2">
        <Button className="larssh-gold-btn larssh-press w-full" asChild>
          <a href={`tel:${display.phone.replace(/\s/g, "")}`}>
            <Phone className="size-4" />
            Call
          </a>
        </Button>
        <Button
          variant="outline"
          className="larssh-press w-full border-white/10 hover:border-gold/30 hover:text-gold"
          asChild
        >
          <a
            href={`https://wa.me/${display.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
        </Button>
        <Button
          variant="outline"
          className="larssh-press w-full border-white/10 hover:border-gold/30 hover:text-gold"
          asChild
        >
          <a href={`mailto:${display.email}`}>
            <Mail className="size-4" />
            Email
          </a>
        </Button>
        <Button
          variant="ghost"
          className="larssh-press w-full hover:text-gold"
          onClick={() => void copyPhone()}
        >
          <Copy className="size-4" />
          Copy Phone
        </Button>
      </div>
    </SectionCard>
  );
}
