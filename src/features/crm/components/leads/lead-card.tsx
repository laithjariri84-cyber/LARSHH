import { Calendar, MapPin, Phone, User } from "lucide-react";

import type { Lead } from "../../types";
import { formatCurrency, formatShortDate } from "../../lib/formatters";
import { PriorityBadge } from "../priority-badge";

type LeadCardProps = {
  lead: Lead;
};

export function LeadCard({ lead }: LeadCardProps) {
  return (
    <article className="group rounded-xl border border-white/5 bg-card/80 p-4 shadow-sm transition-all hover:border-gold/20 hover:shadow-lg hover:shadow-gold/5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold tracking-tight">{lead.clientName}</h3>
          <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
            <Phone className="size-3" />
            {lead.phone}
          </p>
        </div>
        <PriorityBadge priority={lead.priority} />
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <Row label="Budget" value={formatCurrency(lead.budget)} highlight />
        <Row
          label="Area"
          value={lead.preferredArea}
          icon={MapPin}
        />
        <Row label="Bedrooms" value={lead.bedrooms} />
        <Row label="Agent" value={lead.assignedAgent} icon={User} />
        <Row
          label="Follow-up"
          value={formatShortDate(lead.nextFollowUp)}
          icon={Calendar}
        />
      </div>
    </article>
  );
}

function Row({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  icon?: typeof MapPin;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        {Icon ? <Icon className="size-3" /> : null}
        {label}
      </span>
      <span className={highlight ? "text-gold font-medium" : "text-right text-xs font-medium"}>
        {value}
      </span>
    </div>
  );
}
