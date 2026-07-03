"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Minus,
  Plus,
  Share2,
  Trash2,
  X,
  ZoomIn,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notifications";

import type { GalleryPhoto } from "./gallery-types";
import {
  copyImageUrl,
  downloadPhoto,
  getPhotoDisplayUrl,
  shareImageUrl,
} from "./gallery-utils";

type LightboxViewerProps = {
  photos: GalleryPhoto[];
  activeIndex: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  propertyTitle: string;
  canManage?: boolean;
  onDelete?: (photoId: string) => void | Promise<void>;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

export function LightboxViewer({
  photos,
  activeIndex,
  open,
  onClose,
  onIndexChange,
  propertyTitle,
  canManage = false,
  onDelete,
}: LightboxViewerProps) {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const photo = photos[activeIndex];

  const goPrev = useCallback(() => {
    onIndexChange(activeIndex === 0 ? photos.length - 1 : activeIndex - 1);
  }, [activeIndex, onIndexChange, photos.length]);

  const goNext = useCallback(() => {
    onIndexChange(activeIndex === photos.length - 1 ? 0 : activeIndex + 1);
  }, [activeIndex, onIndexChange, photos.length]);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  }, []);

  const toggleZoom = useCallback(() => {
    setZoom((z) => (z > MIN_ZOOM ? MIN_ZOOM : 2));
  }, []);

  const handleDownload = useCallback(async () => {
    if (!photo) return;
    try {
      await downloadPhoto(photo.url, `${photo.id}.jpg`);
      notify.success("Download started");
    } catch {
      notify.errorOccurred("Download failed — try again");
    }
  }, [photo]);

  const handleCopyUrl = useCallback(async () => {
    if (!photo) return;
    await copyImageUrl(photo.url);
    notify.imageUrlCopied();
  }, [photo]);

  const handleShare = useCallback(async () => {
    if (!photo) return;
    const result = await shareImageUrl(propertyTitle, photo.url);
    if (result === "shared") {
      notify.imageShared();
    } else {
      notify.imageUrlCopied();
    }
  }, [photo, propertyTitle]);

  const handleDelete = useCallback(async () => {
    if (!photo || !onDelete) return;
    if (!window.confirm("Delete this photo from the listing?")) return;
    await onDelete(photo.id);
    notify.photoDeleted();
    if (photos.length <= 1) {
      onClose();
    }
  }, [onClose, onDelete, photo, photos.length]);

  useEffect(() => {
    if (open) setZoom(MIN_ZOOM);
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        zoomOut();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, goPrev, goNext, zoomIn, zoomOut]);

  if (!open || !photo) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Property photo lightbox"
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <p className="text-gold text-xs font-medium tracking-[0.2em] uppercase">
            LARSSH
          </p>
          <p className="text-muted-foreground truncate text-sm">
            {photo.caption ?? `Photo ${activeIndex + 1}`} · {activeIndex + 1} /{" "}
            {photos.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-gold"
            onClick={() => void handleShare()}
            aria-label="Share image"
          >
            <Share2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-gold"
            onClick={() => void handleDownload()}
            aria-label="Download image"
          >
            <Download className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-gold"
            onClick={() => void handleCopyUrl()}
            aria-label="Copy image URL"
          >
            <Copy className="size-4" />
          </Button>
          {canManage && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white hover:bg-destructive/20 hover:text-destructive"
              onClick={() => void handleDelete()}
              aria-label="Delete image"
            >
              <Trash2 className="size-4" />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-gold"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
          >
            <Minus className="size-4" />
          </Button>
          <span className="text-muted-foreground hidden min-w-12 text-center text-xs tabular-nums sm:inline">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-gold"
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
          >
            <Plus className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-gold"
            onClick={onClose}
            aria-label="Close lightbox"
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4 md:p-8">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute left-2 z-10 size-11 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-gold md:left-6 md:size-12"
          onClick={goPrev}
          aria-label="Previous photo"
        >
          <ChevronLeft className="size-6" />
        </Button>

        <button
          type="button"
          className="relative flex max-h-full max-w-full cursor-zoom-in items-center justify-center focus:outline-none"
          onClick={toggleZoom}
          aria-label={zoom > MIN_ZOOM ? "Reset zoom" : "Zoom in"}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={photo.id}
            src={getPhotoDisplayUrl(photo)}
            alt={photo.caption ?? `Property photo ${activeIndex + 1}`}
            className={cn(
              "max-h-[calc(100vh-10rem)] max-w-full object-contain transition-transform duration-300 ease-out",
              zoom > MIN_ZOOM && "cursor-zoom-out"
            )}
            style={{ transform: `scale(${zoom})` }}
            draggable={false}
          />
        </button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 z-10 size-11 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-gold md:right-6 md:size-12"
          onClick={goNext}
          aria-label="Next photo"
        >
          <ChevronRight className="size-6" />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-white/10 px-4 py-3 md:hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/15 bg-white/5 text-white hover:bg-white/10"
          onClick={toggleZoom}
        >
          <ZoomIn className="size-4" />
          {zoom > MIN_ZOOM ? "Reset zoom" : "Zoom"}
        </Button>
      </div>
    </div>
  );
}
