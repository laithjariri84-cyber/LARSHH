"use client";

import { useCallback, useState } from "react";
import {
  Crown,
  Download,
  GripVertical,
  Loader2,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PROPERTY_IMAGE_LIMITS } from "@/lib/brand";
import { cn } from "@/lib/utils";

import type { PropertyImageRecord } from "@/features/properties/lib/property-images-api";
import {
  deletePropertyImageById,
  reorderPropertyImageIds,
  setCoverPropertyImage,
} from "@/features/properties/lib/property-images-api";
import { downloadAllPhotos } from "./gallery-utils";

type PhotoManagerProps = {
  propertyId: string;
  images: PropertyImageRecord[];
  isPlaceholder: boolean;
  onChange: () => Promise<void>;
};

export function PhotoManager({
  propertyId,
  images,
  isPlaceholder,
  onChange,
}: PhotoManagerProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const handleReorder = useCallback(
    async (fromId: string, toId: string) => {
      if (fromId === toId) return;
      const current = [...images];
      const fromIndex = current.findIndex((i) => i.id === fromId);
      const toIndex = current.findIndex((i) => i.id === toId);
      if (fromIndex < 0 || toIndex < 0) return;

      const [moved] = current.splice(fromIndex, 1);
      current.splice(toIndex, 0, moved);

      try {
        await reorderPropertyImageIds(
          propertyId,
          current.map((i) => i.id)
        );
        await onChange();
      } catch {
        /* parent refresh restores order */
      }
    },
    [images, onChange, propertyId]
  );

  const handleDelete = async (imageId: string) => {
    setBusyId(imageId);
    try {
      await deletePropertyImageById(propertyId, imageId);
      await onChange();
    } finally {
      setBusyId(null);
    }
  };

  const handleSetCover = async (imageId: string) => {
    setBusyId(imageId);
    try {
      await setCoverPropertyImage(propertyId, imageId);
      await onChange();
    } finally {
      setBusyId(null);
    }
  };

  const handleDownloadAll = async () => {
    const galleryPhotos = images.map((img) => ({
      id: img.id,
      url: img.imageUrl,
      thumbnailUrl: img.imageUrl,
      caption: null,
      isPrimary: img.isCover,
    }));
    await downloadAllPhotos(galleryPhotos, `${propertyId}-photos`);
  };

  if (isPlaceholder) {
    return (
      <div className="larssh-card rounded-2xl p-5 md:p-6">
        <h3 className="text-sm font-semibold text-white">Manage Photos</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Upload photos below to replace preview imagery with your property&apos;s
          real gallery. Images are stored in the database with cloud or local file
          storage depending on your environment.
        </p>
      </div>
    );
  }

  return (
    <div className="larssh-card animate-slide-up space-y-4 rounded-2xl p-5 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Manage Photos</h3>
          <p className="text-muted-foreground mt-1 text-xs tabular-nums">
            {images.length} / {PROPERTY_IMAGE_LIMITS.maxImages} photos
          </p>
        </div>
        {images.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/10 hover:border-gold/30 hover:text-gold"
            onClick={() => void handleDownloadAll()}
          >
            <Download className="size-4" />
            Download All Photos
          </Button>
        ) : null}
      </div>

      {images.length === 0 ? (
        <p className="text-muted-foreground text-sm">No uploaded photos yet.</p>
      ) : (
        <ul className="space-y-2">
          {images.map((image) => (
            <li
              key={image.id}
              draggable
              onDragStart={() => setDragId(image.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) void handleReorder(dragId, image.id);
                setDragId(null);
              }}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-2 transition-all duration-200",
                "hover:border-gold/20",
                dragId === image.id && "opacity-50"
              )}
            >
              <button
                type="button"
                className="text-muted-foreground hover:text-gold cursor-grab p-1 active:cursor-grabbing"
                aria-label="Drag to reorder"
              >
                <GripVertical className="size-4" />
              </button>

              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.imageUrl}
                  alt=""
                  className="size-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-white/80">
                  Photo {image.displayOrder + 1}
                </p>
                {image.isCover ? (
                  <span className="text-gold mt-1 inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase">
                    <Crown className="size-3" />
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-gold mt-1 text-[10px] uppercase tracking-wide"
                    onClick={() => void handleSetCover(image.id)}
                    disabled={busyId === image.id}
                  >
                    Set as cover
                  </button>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => void handleDelete(image.id)}
                disabled={busyId === image.id}
                aria-label="Delete photo"
              >
                {busyId === image.id ? (
                  <Loader2 className="animate-spin size-4" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
