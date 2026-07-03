"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";

import { getPhotoDisplayUrl } from "./gallery-utils";
import type { GalleryPhoto } from "./gallery-types";

type ThumbnailStripProps = {
  photos: GalleryPhoto[];
  activeIndex: number;
  onSelect: (index: number) => void;
  sortable?: boolean;
  onReorder?: (orderedIds: string[]) => void | Promise<void>;
};

export function ThumbnailStrip({
  photos,
  activeIndex,
  onSelect,
  sortable = false,
  onReorder,
}: ThumbnailStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    thumbRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex]);

  const handleDrop = useCallback(
    async (targetId: string) => {
      if (!dragId || dragId === targetId || !onReorder) {
        setDragId(null);
        setDragOverId(null);
        return;
      }

      const current = [...photos];
      const fromIndex = current.findIndex((p) => p.id === dragId);
      const toIndex = current.findIndex((p) => p.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return;

      const [moved] = current.splice(fromIndex, 1);
      current.splice(toIndex, 0, moved);

      setDragId(null);
      setDragOverId(null);
      await onReorder(current.map((p) => p.id));
    },
    [dragId, onReorder, photos]
  );

  return (
    <div
      ref={stripRef}
      className="scrollbar-thin flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin] md:gap-3"
      role="tablist"
      aria-label="Property photo thumbnails"
    >
      {photos.map((photo, index) => {
        const isActive = index === activeIndex;
        const isDragging = dragId === photo.id;
        const isDropTarget = dragOverId === photo.id && dragId !== photo.id;

        return (
          <div
            key={photo.id}
            className={cn(
              "group/thumb relative shrink-0",
              sortable && "pl-0.5"
            )}
            draggable={sortable}
            onDragStart={() => sortable && setDragId(photo.id)}
            onDragEnd={() => {
              setDragId(null);
              setDragOverId(null);
            }}
            onDragOver={(e) => {
              if (!sortable || !dragId) return;
              e.preventDefault();
              setDragOverId(photo.id);
            }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => {
              if (!sortable) return;
              e.preventDefault();
              void handleDrop(photo.id);
            }}
          >
            {sortable ? (
              <span
                className="text-muted-foreground hover:text-gold absolute top-1/2 -left-0.5 z-10 hidden -translate-y-1/2 cursor-grab active:cursor-grabbing sm:block"
                aria-hidden
              >
                <GripVertical className="size-3.5" />
              </span>
            ) : null}

            <button
              ref={(el) => {
                thumbRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={photo.caption ?? `Photo ${index + 1}`}
              onClick={() => onSelect(index)}
              className={cn(
                "group relative shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ease-out",
                "focus-visible:ring-gold/40 focus-visible:ring-2 focus-visible:outline-none",
                isActive
                  ? "border-gold shadow-lg shadow-gold/15 scale-[1.02]"
                  : "border-white/10 opacity-75 hover:border-gold/40 hover:opacity-100",
                isDragging && "opacity-40",
                isDropTarget && "border-gold/70 ring-gold/30 ring-2"
              )}
            >
              <div className="relative size-16 sm:size-20 md:size-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPhotoDisplayUrl(photo, true)}
                  alt=""
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  draggable={false}
                />
                {isActive ? (
                  <span className="from-gold/20 absolute inset-0 bg-gradient-to-t to-transparent" />
                ) : null}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1 text-[10px] font-medium text-white tabular-nums">
                  {index + 1}
                </span>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
