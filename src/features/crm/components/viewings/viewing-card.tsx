import { Building2, Clock, FileText, User, Users } from "lucide-react";

import type { Viewing } from "../../types";
import { formatDate } from "../../lib/formatters";

type ViewingCardProps = {
  viewing: Viewing;
};

export function ViewingCard({ viewing }: ViewingCardProps) {
  return (
    <article className="paragon-card rounded-2xl p-4 transition-colors hover:border-gold/15">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-gold text-[11px] tracking-wider uppercase">
            {formatDate(viewing.date)} · {viewing.time}
          </p>
          <h3 className="mt-2 font-semibold tracking-tight">{viewing.property}</h3>
        </div>
        <span className="text-muted-foreground flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase">
          <Clock className="size-3" />
          {viewing.status}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Meta icon={User} label="Client" value={viewing.client} />
        <Meta icon={Users} label="Agent" value={viewing.agent} />
      </div>

      <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-[11px] tracking-wider uppercase">
          <FileText className="text-gold size-3.5" />
          Viewing Notes
        </div>
        <p className="text-sm leading-7">{viewing.notes}</p>
      </div>
    </article>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
      <p className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wider uppercase">
        <Icon className="size-3" />
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

export function ViewingCalendarDay({
  date,
  viewings,
  isToday,
}: {
  date: Date | null;
  viewings: Viewing[];
  isToday?: boolean;
}) {
  if (!date) {
    return <div className="min-h-[88px] rounded-lg border border-transparent" />;
  }

  return (
    <div
      className={`min-h-[88px] rounded-lg border p-2 ${
        isToday
          ? "border-gold/30 bg-gold-muted/20"
          : "border-white/5 bg-white/[0.02]"
      }`}
    >
      <p className={`text-xs font-medium ${isToday ? "text-gold" : "text-muted-foreground"}`}>
        {date.getDate()}
      </p>
      <div className="mt-2 space-y-1">
        {viewings.slice(0, 2).map((viewing) => (
          <div
            key={viewing.id}
            className="truncate rounded bg-white/5 px-1.5 py-0.5 text-[10px]"
            title={viewing.property}
          >
            {viewing.time} · {viewing.client}
          </div>
        ))}
        {viewings.length > 2 ? (
          <p className="text-muted-foreground text-[10px]">+{viewings.length - 2} more</p>
        ) : null}
      </div>
    </div>
  );
}

export function ViewingCalendarHeader() {
  return (
    <div className="text-muted-foreground mb-2 grid grid-cols-7 gap-2 text-center text-[10px] tracking-wider uppercase">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <span key={day}>{day}</span>
      ))}
    </div>
  );
}

export function ViewingEmptyState({ label }: { label: string }) {
  return (
    <div className="paragon-card rounded-2xl px-6 py-16 text-center">
      <Building2 className="text-muted-foreground mx-auto size-8" />
      <p className="mt-4 font-semibold">{label}</p>
      <p className="text-muted-foreground mt-2 text-sm">
        No viewings scheduled in this segment.
      </p>
    </div>
  );
}
