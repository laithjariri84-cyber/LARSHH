"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type CommunitiesHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  masterCount: number;
  projectCount: number;
};

export function CommunitiesHeader({
  query,
  onQueryChange,
  masterCount,
  projectCount,
}: CommunitiesHeaderProps) {
  return (
    <div className="animate-slide-up space-y-6">
      <div>
        <p className="text-gold text-sm font-medium tracking-[0.2em] uppercase">
          LARSSH
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          Communities
        </h1>
        <p className="text-muted-foreground mt-2 max-w-3xl text-sm md:text-base">
          Navigate master communities and residential projects with enterprise-grade
          intelligence profiles built for portfolio advisory teams.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative max-w-2xl flex-1">
          <Search className="text-gold pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search master communities or residential projects..."
            className="h-12 rounded-2xl border-white/10 bg-card/70 pl-11 backdrop-blur-md focus-visible:border-gold/40 focus-visible:ring-gold/20"
          />
        </div>

        <div className="flex gap-3">
          <StatPill label="Master Communities" value={String(masterCount)} />
          <StatPill label="Residential Projects" value={String(projectCount)} />
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="paragon-card rounded-2xl px-4 py-3">
      <p className="text-muted-foreground text-[11px] tracking-wider uppercase">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
