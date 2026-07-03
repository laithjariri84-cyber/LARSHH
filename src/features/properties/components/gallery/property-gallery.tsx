"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Expand,
  Images,
  Link2,
  Share2,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PropertyPhotoInfo } from "@/features/properties/types";
import { notify } from "@/lib/notifications";
import type { GalleryPhoto } from "./gallery-types";
import {
  copyImageUrl,
  downloadAllPhotos,
  downloadPhoto,
  getPhotoDisplayUrl,
  photoCountLabel,
  resolveGalleryPhotos,
  shareImageUrl,
} from "./gallery-utils";
import { LightboxViewer } from "./lightbox-viewer";
import { ThumbnailStrip } from "./thumbnail-strip";

type PropertyGalleryProps = {
  photos: PropertyPhotoInfo[];
  propertyTitle: string;
  propertyId: string;
  /** When false and no DB photos, shows the luxury empty state instead of placeholders. */
  usePlaceholders?: boolean;
  canManage?: boolean;
  onDelete?: (photoId: string) => void | Promise<void>;
  onReorder?: (orderedIds: string[]) => void | Promise<void>;
  isLoading?: boolean;
};

function GalleryEmptyState() {
  return (
    <div className="larssh-card animate-slide-up flex aspect-[16/10] flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-black via-zinc-950 to-black p-8 text-center md:aspect-[21/9]">
      <div className="paragon-gold-gradient mb-5 flex size-16 items-center justify-center rounded-2xl shadow-lg shadow-gold/10">
        <Images className="text-gold-foreground size-7" />
      </div>
      <p className="text-gold text-xs font-medium tracking-[0.22em] uppercase">
        LARSSH
      </p>
      <h2 className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">
        No photos available.
      </h2>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        Professional photography for this listing will appear here once uploaded
        to the property record.
      </p>
    </div>
  );
}

export function PropertyGallery({
  photos,
  propertyTitle,
  propertyId,
  usePlaceholders = true,
  canManage = false,
  onDelete,
  onReorder,
  isLoading = false,
}: PropertyGalleryProps) {
  const { photos: galleryPhotos, isPlaceholder } = useMemo(
    () => resolveGalleryPhotos(photos as GalleryPhoto[], { usePlaceholders }),
    [photos, usePlaceholders]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const activePhoto = galleryPhotos[activeIndex];
  const hasMultiple = galleryPhotos.length > 1;

  useEffect(() => {
    if (activeIndex >= galleryPhotos.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, galleryPhotos.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? galleryPhotos.length - 1 : i - 1));
  }, [galleryPhotos.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i === galleryPhotos.length - 1 ? 0 : i + 1));
  }, [galleryPhotos.length]);

  const handleShareProperty = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyTitle,
          text: `View ${propertyTitle} on LARSSH`,
          url,
        });
        return;
      } catch {
        /* user cancelled or unsupported */
      }
    }
    await navigator.clipboard.writeText(url);
    notify.linkCopied();
  }, [propertyTitle]);

  const handleCopyPropertyLink = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    notify.linkCopied();
  }, []);

  const handleShareImage = useCallback(async () => {
    if (!activePhoto) return;
    const result = await shareImageUrl(propertyTitle, activePhoto.url);
    if (result === "shared") {
      notify.imageShared();
    } else {
      notify.imageUrlCopied();
    }
  }, [activePhoto, propertyTitle]);

  const handleCopyImageUrl = useCallback(async () => {
    if (!activePhoto) return;
    await copyImageUrl(activePhoto.url);
    notify.imageUrlCopied();
  }, [activePhoto]);

  const handleDownloadImage = useCallback(async () => {
    if (!activePhoto) return;
    try {
      const ext = activePhoto.url.split(".").pop()?.split("?")[0] ?? "jpg";
      await downloadPhoto(activePhoto.url, `${propertyId}-photo-${activeIndex + 1}.${ext}`);
      notify.success("Download started");
    } catch {
      notify.errorOccurred("Download failed — try again");
    }
  }, [activeIndex, activePhoto, propertyId]);

  const handleDownloadAll = useCallback(async () => {
    if (!galleryPhotos.length) return;
    try {
      if (galleryPhotos.length === 1) {
        await downloadPhoto(
          galleryPhotos[0].url,
          `${propertyId}-photo.jpg`
        );
      } else {
        await downloadAllPhotos(galleryPhotos, `${propertyId}-photo`);
      }
      notify.success("Download started");
    } catch {
      notify.errorOccurred("Download failed — try again");
    }
  }, [galleryPhotos, propertyId]);

  const handleDeleteImage = useCallback(async () => {
    if (!activePhoto || !onDelete || isPlaceholder) return;
    if (!window.confirm("Delete this photo from the listing?")) return;
    await onDelete(activePhoto.id);
    notify.photoDeleted();
    setActiveIndex((i) => Math.max(0, i - 1));
  }, [activePhoto, isPlaceholder, onDelete]);

  if (galleryPhotos.length === 0 && !isLoading) {
    return <GalleryEmptyState />;
  }

  return (
    <section className="animate-slide-up space-y-3 md:space-y-4" aria-label="Property gallery">
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/50">
        {isLoading ? (
          <Skeleton className="aspect-[4/3] w-full rounded-none md:aspect-[21/9]" />
        ) : null}
        <button
          type="button"
          className={cn(
            "relative block w-full cursor-zoom-in focus-visible:ring-gold/40 focus-visible:ring-2 focus-visible:outline-none",
            isLoading && "pointer-events-none absolute inset-0 opacity-0"
          )}
          onClick={() => setLightboxOpen(true)}
          aria-label="Open photo in fullscreen lightbox"
        >
          <div className="relative aspect-[4/3] w-full md:aspect-[21/9]">
            {galleryPhotos.map((photo, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.id}
                src={getPhotoDisplayUrl(photo)}
                alt={photo.caption ?? `Property photo ${index + 1}`}
                className={cn(
                  "absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out",
                  index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0",
                  !loadedImages[photo.id] && index === activeIndex && "opacity-0"
                )}
                draggable={false}
                fetchPriority={index === 0 ? "high" : "auto"}
                onLoad={() =>
                  setLoadedImages((prev) => ({ ...prev, [photo.id]: true }))
                }
              />
            ))}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />
          </div>
        </button>

        <div className="pointer-events-none absolute top-3 left-3 z-10 md:top-4 md:left-4">
          <div className="larssh-glass pointer-events-auto inline-flex items-center gap-2 rounded-full px-3 py-1.5">
            <Images className="text-gold size-3.5" />
            <span className="text-xs font-semibold tracking-wide text-white">
              {photoCountLabel(galleryPhotos.length)}
            </span>
            {isPlaceholder ? (
              <span className="text-gold/80 hidden text-[10px] font-medium uppercase tracking-wider sm:inline">
                Preview
              </span>
            ) : null}
          </div>
        </div>

        {hasMultiple ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 left-2 z-10 size-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/70 hover:text-gold group-hover:opacity-100 md:left-4 md:size-11"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-5 md:size-6" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-2 z-10 size-10 -translate-y-1/2 rounded-full border border-white/10 bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/70 hover:text-gold group-hover:opacity-100 md:right-4 md:size-11"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next photo"
            >
              <ChevronRight className="size-5 md:size-6" />
            </Button>
          </>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 md:p-5">
          <div className="pointer-events-auto min-w-0">
            {activePhoto?.caption ? (
              <p className="text-sm font-medium text-white drop-shadow-md md:text-base">
                {activePhoto.caption}
              </p>
            ) : null}
            <p className="text-xs text-white/70 tabular-nums">
              {activeIndex + 1} / {galleryPhotos.length}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="pointer-events-auto hidden border border-white/10 bg-black/50 text-white backdrop-blur-md hover:border-gold/30 hover:bg-black/70 hover:text-gold sm:inline-flex"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
          >
            <Expand className="size-4" />
            View fullscreen
          </Button>
        </div>

        <div className="absolute top-3 right-3 z-10 flex max-w-[calc(100%-8rem)] flex-wrap items-start justify-end gap-1.5 md:top-4 md:right-4 md:gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 border border-white/10 bg-black/50 px-2 text-white backdrop-blur-md hover:border-gold/30 hover:bg-black/70 hover:text-gold md:h-9 md:px-2.5"
            onClick={(e) => {
              e.stopPropagation();
              void handleShareImage();
            }}
            aria-label="Share image"
          >
            <Share2 className="size-4 shrink-0" />
            <span className="hidden lg:inline">Share</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 border border-white/10 bg-black/50 px-2 text-white backdrop-blur-md hover:border-gold/30 hover:bg-black/70 hover:text-gold md:h-9 md:px-2.5"
            onClick={(e) => {
              e.stopPropagation();
              void handleDownloadImage();
            }}
            aria-label="Download image"
          >
            <Download className="size-4 shrink-0" />
            <span className="hidden lg:inline">Download</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 border border-white/10 bg-black/50 px-2 text-white backdrop-blur-md hover:border-gold/30 hover:bg-black/70 hover:text-gold md:h-9 md:px-2.5"
            onClick={(e) => {
              e.stopPropagation();
              void handleCopyImageUrl();
            }}
            aria-label="Copy image URL"
          >
            <Copy className="size-4 shrink-0" />
            <span className="hidden lg:inline">Copy URL</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 border border-white/10 bg-black/50 px-2 text-white backdrop-blur-md hover:border-gold/30 hover:bg-black/70 hover:text-gold md:h-9 md:px-2.5"
            onClick={(e) => {
              e.stopPropagation();
              void handleShareProperty();
            }}
            aria-label="Share property"
          >
            <Share2 className="size-4 shrink-0" />
            <span className="hidden xl:inline">Share listing</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 border border-white/10 bg-black/50 px-2 text-white backdrop-blur-md hover:border-gold/30 hover:bg-black/70 hover:text-gold md:h-9 md:px-2.5"
            onClick={(e) => {
              e.stopPropagation();
              void handleCopyPropertyLink();
            }}
            aria-label="Copy property link"
          >
            <Link2 className="size-4 shrink-0" />
            <span className="hidden xl:inline">Copy link</span>
          </Button>
          {hasMultiple ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="hidden h-8 border border-white/10 bg-black/50 px-2 text-white backdrop-blur-md hover:border-gold/30 hover:bg-black/70 hover:text-gold md:inline-flex md:h-9 md:px-2.5"
              onClick={(e) => {
                e.stopPropagation();
                void handleDownloadAll();
              }}
              aria-label="Download all photos"
            >
              <Download className="size-4 shrink-0" />
              <span className="hidden xl:inline">All photos</span>
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 border border-white/10 bg-black/50 px-2 text-white backdrop-blur-md hover:border-gold/30 hover:bg-black/70 hover:text-gold md:h-9 md:px-2.5"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            aria-label="Fullscreen"
          >
            <Expand className="size-4 shrink-0" />
            <span className="hidden lg:inline">Fullscreen</span>
          </Button>
          {canManage && onDelete && !isPlaceholder ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 border border-white/10 bg-black/50 px-2 text-white backdrop-blur-md hover:border-destructive/40 hover:bg-destructive/20 hover:text-destructive md:h-9 md:px-2.5"
              onClick={(e) => {
                e.stopPropagation();
                void handleDeleteImage();
              }}
              aria-label="Delete image"
            >
              <Trash2 className="size-4 shrink-0" />
              <span className="hidden lg:inline">Delete</span>
            </Button>
          ) : null}
        </div>
      </div>

      {hasMultiple ? (
        <ThumbnailStrip
          photos={galleryPhotos}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
          sortable={canManage && !isPlaceholder}
          onReorder={onReorder}
        />
      ) : null}

      <LightboxViewer
        photos={galleryPhotos}
        activeIndex={activeIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setActiveIndex}
        propertyTitle={propertyTitle}
        canManage={canManage && !isPlaceholder}
        onDelete={onDelete}
      />
    </section>
  );
}
