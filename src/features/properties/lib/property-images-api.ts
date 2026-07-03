export type PropertyImageRecord = {
  id: string;
  propertyId: string;
  imageUrl: string;
  storagePath: string;
  displayOrder: number;
  isCover: boolean;
  uploadedAt: string;
};

export function mapPhotosToGallery(
  photos: {
    id: string;
    url: string;
    thumbnailUrl: string | null;
    caption: string | null;
    isPrimary: boolean;
  }[]
) {
  return photos.map((p) => ({
    id: p.id,
    url: p.url,
    thumbnailUrl: p.thumbnailUrl,
    caption: p.caption,
    isPrimary: p.isPrimary,
  }));
}

export async function fetchPropertyImages(
  propertyId: string
): Promise<PropertyImageRecord[]> {
  const res = await fetch(`/api/v1/properties/${propertyId}/images`);
  if (!res.ok) throw new Error("Failed to load property images");
  const json = (await res.json()) as { data: PropertyImageRecord[] };
  return json.data;
}

export function recordsToGalleryPhotos(records: PropertyImageRecord[]) {
  return records.map((r) => ({
    id: r.id,
    url: r.imageUrl,
    thumbnailUrl: r.imageUrl,
    caption: null as string | null,
    isPrimary: r.isCover,
  }));
}

export async function uploadPropertyImageFiles(
  propertyId: string,
  files: File[],
  onProgress?: (percent: number) => void
): Promise<PropertyImageRecord[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  onProgress?.(10);

  const res = await fetch(`/api/v1/properties/${propertyId}/images`, {
    method: "POST",
    body: formData,
  });

  onProgress?.(100);

  if (!res.ok) {
    const json = (await res.json()) as { error?: { message?: string } };
    throw new Error(json.error?.message ?? "Upload failed");
  }

  const json = (await res.json()) as { data: PropertyImageRecord[] };
  return json.data;
}

export async function deletePropertyImageById(
  propertyId: string,
  imageId: string
) {
  const res = await fetch(
    `/api/v1/properties/${propertyId}/images/${imageId}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Delete failed");
}

export async function setCoverPropertyImage(
  propertyId: string,
  imageId: string
) {
  const res = await fetch(
    `/api/v1/properties/${propertyId}/images/${imageId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set-cover" }),
    }
  );
  if (!res.ok) throw new Error("Failed to set cover photo");
}

export async function reorderPropertyImageIds(
  propertyId: string,
  orderedIds: string[]
): Promise<PropertyImageRecord[]> {
  const res = await fetch(`/api/v1/properties/${propertyId}/images/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderedIds }),
  });
  if (!res.ok) throw new Error("Reorder failed");
  const json = (await res.json()) as { data: PropertyImageRecord[] };
  return json.data;
}
