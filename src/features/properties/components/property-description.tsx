"use client";

import { useMemo, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { SectionCard } from "./section-card";

type PropertyDescriptionProps = {
  description: string | null;
};

const COLLAPSE_THRESHOLD = 420;

export function PropertyDescription({ description }: PropertyDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  const isLong = useMemo(
    () => (description?.length ?? 0) > COLLAPSE_THRESHOLD,
    [description]
  );

  return (
    <SectionCard
      title="Description"
      description="Marketing narrative for this listing"
    >
      {description ? (
        <div className="relative">
          <div className="text-muted-foreground mb-4 flex items-center gap-2 text-xs font-medium tracking-[0.16em] uppercase">
            <FileText className="text-gold size-3.5" />
            About this property
          </div>

          <div
            className={cn(
              "relative overflow-hidden transition-[max-height] duration-500 ease-in-out",
              !expanded && isLong && "max-h-48"
            )}
          >
            <p className="text-base leading-8 text-white/90 whitespace-pre-wrap md:text-[17px] md:leading-8">
              {description}
            </p>
            {!expanded && isLong ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />
            ) : null}
          </div>

          {isLong ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gold mt-4 hover:text-gold/80"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Show less" : "Read more"}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-300",
                  expanded && "rotate-180"
                )}
              />
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No description provided.</p>
      )}
    </SectionCard>
  );
}
