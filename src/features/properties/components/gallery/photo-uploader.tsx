"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PROPERTY_IMAGE_LIMITS } from "@/lib/brand";
import {
  compressImageFiles,
  revokeCompressedPreviews,
  type CompressedImage,
} from "@/lib/images/compress-image";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notifications";

type PhotoUploaderProps = {
  propertyId: string;
  currentCount: number;
  onUploaded: () => Promise<void> | void;
  disabled?: boolean;
};

export function PhotoUploader({
  propertyId,
  currentCount,
  onUploaded,
  disabled,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState<CompressedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const remaining = PROPERTY_IMAGE_LIMITS.maxImages - currentCount;

  const clearPreviews = useCallback((items: CompressedImage[]) => {
    revokeCompressedPreviews(items);
    setPreviews([]);
  }, []);

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setError(null);
      const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));

      if (!files.length) {
        setError("Please select valid image files");
        return;
      }

      if (files.length > remaining) {
        setError(`You can upload ${remaining} more photo${remaining === 1 ? "" : "s"}`);
        return;
      }

      try {
        const compressed = await compressImageFiles(files);
        setPreviews((prev) => {
          revokeCompressedPreviews(prev);
          return compressed;
        });
      } catch {
        setError("Could not process one or more images");
      }
    },
    [remaining]
  );

  const handleUpload = useCallback(async () => {
    if (!previews.length) return;
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const { uploadPropertyImageFiles } = await import(
        "@/features/properties/lib/property-images-api"
      );
      await uploadPropertyImageFiles(
        propertyId,
        previews.map((p) => p.file),
        setProgress
      );
      clearPreviews(previews);
      await onUploaded();
      notify.photoUploaded(previews.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      notify.errorOccurred(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [clearPreviews, onUploaded, previews, propertyId]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) void processFiles(e.dataTransfer.files);
        }}
        className={cn(
          "larssh-card relative rounded-2xl border-2 border-dashed p-6 transition-all duration-300 md:p-8",
          dragOver
            ? "border-gold/50 bg-gold-muted/30"
            : "border-white/10 hover:border-gold/25",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={PROPERTY_IMAGE_LIMITS.allowedMimeTypes.join(",")}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void processFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="flex flex-col items-center text-center">
          <div className="larssh-glass mb-4 flex size-14 items-center justify-center rounded-2xl">
            <Upload className="text-gold size-6" />
          </div>
          <p className="text-sm font-medium text-white">Drag & drop photos here</p>
          <p className="text-muted-foreground mt-1 text-xs">
            JPG, JPEG, PNG, WEBP · up to 20MB each · {remaining} slots remaining
          </p>
          <Button
            type="button"
            className="larssh-gold-btn mt-4"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || remaining <= 0}
          >
            <ImagePlus className="size-4" />
            Upload Photos
          </Button>
        </div>

        {uploading ? (
          <div className="absolute inset-x-6 bottom-4 md:inset-x-8">
            <div className="bg-muted/40 h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-gold h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-muted-foreground mt-2 text-center text-xs">
              Uploading… {progress}%
            </p>
          </div>
        ) : null}
      </div>

      {previews.length > 0 ? (
        <div className="larssh-card animate-slide-up space-y-4 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Preview before upload</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => clearPreviews(previews)}
            >
              Clear
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {previews.map((item) => (
              <figure
                key={item.previewUrl}
                className="relative overflow-hidden rounded-xl border border-white/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt={item.originalName}
                  className="aspect-square size-full object-cover"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:text-gold"
                  onClick={() =>
                    setPreviews((prev) => {
                      const next = prev.filter((p) => p.previewUrl !== item.previewUrl);
                      URL.revokeObjectURL(item.previewUrl);
                      return next;
                    })
                  }
                  aria-label="Remove preview"
                >
                  <X className="size-3.5" />
                </button>
              </figure>
            ))}
          </div>
          <Button
            type="button"
            className="larssh-gold-btn w-full sm:w-auto"
            disabled={uploading}
            onClick={() => void handleUpload()}
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" /> Uploading…
              </>
            ) : (
              <>Confirm upload ({previews.length})</>
            )}
          </Button>
        </div>
      ) : null}

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
