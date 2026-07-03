import { PROPERTY_IMAGE_LIMITS } from "@/lib/brand";

const MAX_DIMENSION = 2400;
const DEFAULT_QUALITY = 0.85;

export type CompressedImage = {
  file: File;
  previewUrl: string;
  originalName: string;
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
      mimeType,
      quality
    );
  });
}

export async function compressImageFile(file: File): Promise<CompressedImage> {
  if (!PROPERTY_IMAGE_LIMITS.allowedMimeTypes.includes(file.type as never)) {
    throw new Error("Unsupported image format");
  }

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.drawImage(img, 0, 0, width, height);

  const outputType =
    file.type === "image/png" ? "image/webp" : file.type || "image/jpeg";
  const blob = await canvasToBlob(canvas, outputType, DEFAULT_QUALITY);
  const ext = outputType.split("/")[1] ?? "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const compressed = new File([blob], `${baseName}.${ext}`, {
    type: outputType,
    lastModified: Date.now(),
  });

  return {
    file: compressed,
    previewUrl: URL.createObjectURL(compressed),
    originalName: file.name,
  };
}

export async function compressImageFiles(files: File[]): Promise<CompressedImage[]> {
  const results: CompressedImage[] = [];
  for (const file of files) {
    results.push(await compressImageFile(file));
  }
  return results;
}

export function revokeCompressedPreviews(items: CompressedImage[]) {
  for (const item of items) {
    URL.revokeObjectURL(item.previewUrl);
  }
}
