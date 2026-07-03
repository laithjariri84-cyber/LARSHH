import Link from "next/link";
import { ArrowUpRight, Building2, TrendingUp } from "lucide-react";

import type { ResidentialProject } from "../types";
import { cn } from "@/lib/utils";

type ResidentialProjectCardProps = {
  masterSlug: string;
  project: ResidentialProject;
  index: number;
};

export function ResidentialProjectCard({
  masterSlug,
  project,
  index,
}: ResidentialProjectCardProps) {
  const href = `/communities/${masterSlug}/${project.slug}`;

  return (
    <Link
      href={href}
      className={cn(
        "group paragon-card animate-slide-up overflow-hidden rounded-2xl transition-all duration-300",
        "hover:border-gold/25 hover:shadow-lg hover:shadow-gold/5"
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div
        className={cn(
          "relative flex h-28 items-end bg-gradient-to-br p-4",
          project.imageGradient
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
        <div className="relative z-10 flex w-full items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium tracking-wider text-white/70 uppercase">
              Residential Project
            </p>
            <h3 className="mt-1 text-base font-semibold text-white">
              {project.name}
            </h3>
          </div>
          <div className="bg-black/20 flex size-9 items-center justify-center rounded-xl backdrop-blur-sm transition-transform group-hover:scale-105">
            <ArrowUpRight className="size-4 text-white" />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {project.tagline}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <MiniMetric
            icon={Building2}
            label="Listings"
            value={String(project.intelligence.activeListings.length)}
          />
          <MiniMetric
            icon={TrendingUp}
            label="ROI"
            value={project.intelligence.roi.value}
          />
        </div>

        <div className="text-gold flex items-center gap-2 text-xs font-medium">
          Open Community Intelligence
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}

function MiniMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
      <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] tracking-wider uppercase">
        <Icon className="size-3" />
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
