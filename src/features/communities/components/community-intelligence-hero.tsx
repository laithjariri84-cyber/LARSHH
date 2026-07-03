"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import type { MasterCommunity, ResidentialProject } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CommunityIntelligenceHeroProps = {
  master: MasterCommunity;
  project: ResidentialProject;
};

export function CommunityIntelligenceHero({
  master,
  project,
}: CommunityIntelligenceHeroProps) {
  return (
    <div className="animate-slide-up space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-gold -ml-2 h-8 px-2"
        >
          <Link href="/communities">
            <ArrowLeft className="mr-1 size-3.5" />
            Communities
          </Link>
        </Button>
        <ChevronRight className="text-muted-foreground size-3.5" />
        <span className="text-muted-foreground">{master.name}</span>
        <ChevronRight className="text-muted-foreground size-3.5" />
        <span className="font-medium">{project.name}</span>
      </div>

      <div className="paragon-card overflow-hidden rounded-2xl">
        <div
          className={cn(
            "relative flex min-h-[220px] items-end bg-gradient-to-br p-6 md:min-h-[260px] md:p-8",
            project.imageGradient
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-white/20 bg-black/20 text-[10px] text-white backdrop-blur-sm"
              >
                Community Intelligence
              </Badge>
              <Badge
                variant="outline"
                className="border-gold/30 bg-gold/10 text-[10px] text-gold backdrop-blur-sm"
              >
                {master.name}
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {project.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80 md:text-base">
              {project.tagline}
            </p>
          </div>
          <Sparkles className="text-gold absolute top-6 right-6 size-5 opacity-80" />
        </div>

        <div className="grid gap-4 border-t border-white/5 p-5 md:grid-cols-3 md:p-6">
          <HeroFact icon={Building2} label="Master Community" value={master.name} />
          <HeroFact label="Region" value={master.region} />
          <HeroFact
            label="Active Listings"
            value={String(project.intelligence.activeListings.length)}
          />
        </div>
      </div>
    </div>
  );
}

function HeroFact({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="text-muted-foreground flex items-center gap-2 text-[11px] tracking-wider uppercase">
        {Icon ? <Icon className="text-gold size-3.5" /> : null}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
