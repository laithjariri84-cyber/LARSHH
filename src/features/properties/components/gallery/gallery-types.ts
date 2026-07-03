import type { PropertyPhotoInfo } from "@/features/properties/types";

export type GalleryPhoto = PropertyPhotoInfo;

export type GalleryResolvedPhotos = {
  photos: GalleryPhoto[];
  /** True when displaying stock placeholders because the database returned no photos. */
  isPlaceholder: boolean;
};
