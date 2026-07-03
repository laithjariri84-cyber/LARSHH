import type { GalleryPhoto, GalleryResolvedPhotos } from "./gallery-types";

/** Stock luxury property imagery — used until database photos are connected. */
export const PLACEHOLDER_PROPERTY_PHOTOS: GalleryPhoto[] = [
  {
    id: "placeholder-1",
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=70",
    caption: "Exterior view",
    isPrimary: true,
  },
  {
    id: "placeholder-2",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=70",
    caption: "Living area",
    isPrimary: false,
  },
  {
    id: "placeholder-3",
    url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1920&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=400&q=70",
    caption: "Master suite",
    isPrimary: false,
  },
  {
    id: "placeholder-4",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=70",
    caption: "Pool & terrace",
    isPrimary: false,
  },
  {
    id: "placeholder-5",
    url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=400&q=70",
    caption: "Kitchen",
    isPrimary: false,
  },
  {
    id: "placeholder-6",
    url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1920&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=400&q=70",
    caption: "City skyline view",
    isPrimary: false,
  },
];

export function sortPhotosPrimaryFirst(photos: GalleryPhoto[]): GalleryPhoto[] {
  return [...photos].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
}

export function resolveGalleryPhotos(
  photos: GalleryPhoto[],
  options?: { usePlaceholders?: boolean }
): GalleryResolvedPhotos {
  const usePlaceholders = options?.usePlaceholders ?? true;

  if (photos.length > 0) {
    return { photos: sortPhotosPrimaryFirst(photos), isPlaceholder: false };
  }

  if (usePlaceholders) {
    return { photos: PLACEHOLDER_PROPERTY_PHOTOS, isPlaceholder: true };
  }

  return { photos: [], isPlaceholder: false };
}

export function getPhotoDisplayUrl(photo: GalleryPhoto, preferThumbnail = false): string {
  if (preferThumbnail && photo.thumbnailUrl) return photo.thumbnailUrl;
  return photo.url;
}

export async function downloadPhoto(url: string, filename: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("fetch failed");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  } catch {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
  }
}

export async function downloadAllPhotos(photos: GalleryPhoto[], baseName: string) {
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const ext = photo.url.split(".").pop()?.split("?")[0] ?? "jpg";
    await downloadPhoto(photo.url, `${baseName}-${i + 1}.${ext}`);
  }
}

export function photoCountLabel(count: number): string {
  return count === 1 ? "1 Photo" : `${count} Photos`;
}

export async function copyImageUrl(url: string) {
  await navigator.clipboard.writeText(url);
}

export async function shareImageUrl(title: string, imageUrl: string) {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: title,
        url: imageUrl,
      });
      return "shared" as const;
    } catch {
      /* user cancelled or unsupported */
    }
  }

  await copyImageUrl(imageUrl);
  return "copied" as const;
}
