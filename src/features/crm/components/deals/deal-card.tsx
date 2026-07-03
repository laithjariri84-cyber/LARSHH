import { Building2, Calendar, DollarSign, User } from "lucide-react";

import type { Deal } from "../../types";
import { formatCurrency, formatShortDate } from "../../lib/formatters";

type DealCardProps = {
  deal: Deal;
};

export function DealCard({ deal }: DealCardProps) {
  return (
    <article className="rounded-xl border border-white/5 bg-card/80 p-4 transition-all hover:border-gold/20 hover:shadow-lg hover:shadow-gold/5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold tracking-tight">{deal.clientName}</h3>
          <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
            <Building2 className="size-3" />
            {deal.property}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <Row icon={DollarSign} label="Deal Value" value={formatCurrency(deal.value)} highlight />
        <Row icon={DollarSign} label="Commission" value={formatCurrency(deal.commission)} />
        <Row icon={User} label="Agent" value={deal.agent} />
        <Row icon={Calendar} label="Expected Close" value={formatShortDate(deal.expectedClose)} />
      </div>
    </article>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <Icon className="size-3" />
        {label}
      </span>
      <span className={highlight ? "text-gold font-medium" : "text-xs font-medium"}>
        {value}
      </span>
    </div>
  );
}
