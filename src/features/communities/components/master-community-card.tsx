"use client";

import { useState } from "react";
import {
  ChevronDown,
  Layers3,
  MapPin,
  Sparkles,
} from "lucide-react";

import type { MasterCommunity } from "../types";
import { ResidentialProjectCard } from "./residential-project-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MasterCommunityCardProps = {
  master: MasterCommunity;
  index: number;
  defaultExpanded?: boolean;
};

export function MasterCommunityCard({
  master,
  index,
  defaultExpanded = false,
}: MasterCommunityCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <article
      className={cn(
        "paragon-card animate-slide-up overflow-hidden rounded-2xl transition-all duration-300",
        expanded && "border-gold/20 shadow-lg shadow-gold/5"
      )}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="group flex w-full items-stretch text-left"
        aria-expanded={expanded}
      >
        <div
          className={cn(
            "relative hidden w-40 shrink-0 bg-gradient-to-br sm:block lg:w-52",
            master.imageGradient
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80" />
          <Sparkles className="text-gold absolute top-4 left-4 size-4" />
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-gold/20 bg-gold-muted text-gold text-[10px]"
                >
                  Master Community
                </Badge>
                <Badge variant="outline" className="border-white/10 text-[10px]">
                  {master.projects.length} projects
                </Badge>
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">
                {master.name}
              </h2>
              <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
                <MapPin className="text-gold size-3.5 shrink-0" />
                {master.region}
              </p>
            </div>

            <div
              className={cn(
                "bg-gold-muted text-gold flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300",
                expanded && "rotate-180"
              )}
            >
              <ChevronDown className="size-4" />
            </div>
          </div>

          <p className="text-muted-foreground max-w-3xl text-sm leading-7">
            {master.description}
          </p>

          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Layers3 className="text-gold size-3.5" />
            {expanded
              ? "Residential projects visible below"
              : "Click to reveal residential projects"}
          </div>
        </div>
      </button>

      <div
        className={cn(
          "grid transition-all duration-500 ease-in-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/5 px-5 pt-2 pb-5 md:px-6 md:pb-6">
            {master.projects.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {master.projects.map((project, projectIndex) => (
                  <ResidentialProjectCard
                    key={project.id}
                    masterSlug={master.slug}
                    project={project}
                    index={projectIndex}
                  />
                ))}
              </div>
            ) : (
              <EmptyProjectsState masterName={master.name} />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyProjectsState({ masterName }: { masterName: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
      <Layers3 className="text-muted-foreground mx-auto size-8" />
      <h3 className="mt-4 text-base font-semibold">Projects onboarding in progress</h3>
      <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-sm leading-7">
        Residential projects for {masterName} will appear here as portfolio data is
        indexed. The master community record is ready for future expansion.
      </p>
    </div>
  );
}
