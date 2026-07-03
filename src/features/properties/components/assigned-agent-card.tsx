import { Mail, Phone, ShieldCheck, UserRound } from "lucide-react";



import type { PropertyAgentInfo } from "@/features/properties/types";

import { getInitials } from "@/lib/utils";

import { SectionCard } from "./section-card";

import { AgentEmptyState } from "./empty-state";



type AssignedAgentCardProps = {

  agent: PropertyAgentInfo | null;

};



export function AssignedAgentCard({ agent }: AssignedAgentCardProps) {

  return (

    <SectionCard

      title="Assigned Agent"

      description="Primary listing representative"

    >

      {!agent ? (

        <AgentEmptyState />

      ) : (

        <div className="flex flex-col items-center text-center">

          <div className="paragon-gold-gradient flex size-20 items-center justify-center rounded-2xl text-xl font-semibold shadow-lg shadow-gold/10">

            <span className="text-gold-foreground">{getInitials(agent.fullName)}</span>

          </div>

          <p className="mt-4 text-base font-semibold">{agent.fullName}</p>

          {agent.agencyName ? (

            <p className="text-muted-foreground mt-1 text-sm">

              {agent.agencyName}

            </p>

          ) : null}



          <div className="mt-6 w-full space-y-3 text-left">

            <ContactRow icon={Phone} label="Phone" value={agent.phone ?? "—"} />

            <ContactRow icon={Mail} label="Email" value={agent.email ?? "—"} />

            {agent.licenseNumber ? (

              <ContactRow

                icon={ShieldCheck}

                label="License"

                value={agent.licenseNumber}

              />

            ) : null}

          </div>

        </div>

      )}

    </SectionCard>

  );

}



function ContactRow({

  icon: Icon,

  label,

  value,

}: {

  icon: typeof Phone;

  label: string;

  value: string;

}) {

  return (

    <div className="larssh-glass flex items-center gap-3 rounded-xl px-3 py-3">

      <Icon className="text-gold size-4 shrink-0" />

      <div className="min-w-0">

        <p className="larssh-label">{label}</p>

        <p className="truncate text-sm font-medium">{value}</p>

      </div>

    </div>

  );

}



export function OwnerInformationCard() {

  return (

    <SectionCard

      title="Owner Information"

      description="Restricted — private details are not displayed"

    >

      <div className="space-y-4">

        <div className="larssh-glass flex items-start gap-3 rounded-xl border border-dashed border-white/10 px-4 py-4">

          <UserRound className="text-muted-foreground mt-0.5 size-4 shrink-0" />

          <div>

            <p className="text-sm font-medium">Owner details protected</p>

            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">

              Owner identity and contact information are withheld on this screen.

              Authorized workflows will expose this data in a future release.

            </p>

          </div>

        </div>



        <div className="grid gap-3">

          <PlaceholderField label="Owner name" />

          <PlaceholderField label="Email" />

          <PlaceholderField label="Phone" />

        </div>

      </div>

    </SectionCard>

  );

}



function PlaceholderField({ label }: { label: string }) {

  return (

    <div className="rounded-xl border border-white/5 px-3 py-2.5">

      <p className="larssh-label">{label}</p>

      <p className="text-muted-foreground mt-1 text-sm">Restricted</p>

    </div>

  );

}

