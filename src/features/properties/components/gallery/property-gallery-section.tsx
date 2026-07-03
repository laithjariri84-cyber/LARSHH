"use client";

import { useCallback, useEffect, useState } from "react";

import type { PropertyPhotoInfo } from "@/features/properties/types";
import {
  deletePropertyImageById,
  fetchPropertyImages,
  recordsToGalleryPhotos,
  reorderPropertyImageIds,
  type PropertyImageRecord,
} from "@/features/properties/lib/property-images-api";

import { PhotoManager } from "./photo-manager";
import { PhotoUploader } from "./photo-uploader";
import { PropertyGallery } from "./property-gallery";

type PropertyGallerySectionProps = {
  propertyId: string;
  propertyTitle: string;
  initialPhotos: PropertyPhotoInfo[];
};

export function PropertyGallerySection({
  propertyId,
  propertyTitle,
  initialPhotos,
}: PropertyGallerySectionProps) {
  const [galleryPhotos, setGalleryPhotos] = useState(initialPhotos);
  const [imageRecords, setImageRecords] = useState<PropertyImageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await fetchPropertyImages(propertyId);
      setImageRecords(records);
      if (records.length > 0) {
        setGalleryPhotos(recordsToGalleryPhotos(records));
      } else if (initialPhotos.length > 0) {
        setGalleryPhotos(initialPhotos);
      } else {
        setGalleryPhotos([]);
      }
    } catch {
      setGalleryPhotos(initialPhotos);
    } finally {
      setIsLoading(false);
    }
  }, [initialPhotos, propertyId]);

  useEffect(() => {
    void refreshImages();
  }, [refreshImages]);

  const hasUploadedPhotos = imageRecords.length > 0;

  const handleDelete = useCallback(
    async (imageId: string) => {
      await deletePropertyImageById(propertyId, imageId);
      await refreshImages();
    },
    [propertyId, refreshImages]
  );

  const handleReorder = useCallback(
    async (orderedIds: string[]) => {
      await reorderPropertyImageIds(propertyId, orderedIds);
      await refreshImages();
    },
    [propertyId, refreshImages]
  );

  return (
    <div className="space-y-5 md:space-y-6">
      <PropertyGallery
        photos={galleryPhotos}
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        usePlaceholders={!hasUploadedPhotos && galleryPhotos.length === 0}
        canManage={hasUploadedPhotos}
        onDelete={handleDelete}
        onReorder={handleReorder}
        isLoading={isLoading}
      />

      <PhotoManager
        propertyId={propertyId}
        images={imageRecords}
        isPlaceholder={!hasUploadedPhotos}
        onChange={refreshImages}
      />

      <PhotoUploader
        propertyId={propertyId}
        currentCount={imageRecords.length}
        onUploaded={refreshImages}
      />
    </div>
  );
}
