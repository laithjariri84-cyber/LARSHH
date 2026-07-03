import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";
import {
  deletePropertyImageFile,
  uploadPropertyImageFile,
} from "@/lib/storage/property-images";
import { PROPERTY_IMAGE_LIMITS } from "@/lib/brand";
import type { ServiceResult } from "@/types/service";

export type PropertyImageDto = {
  id: string;
  propertyId: string;
  imageUrl: string;
  storagePath: string;
  displayOrder: number;
  isCover: boolean;
  uploadedAt: string;
};

function mapImage(row: {
  id: string;
  propertyId: string;
  imageUrl: string;
  storagePath: string;
  displayOrder: number;
  isCover: boolean;
  uploadedAt: Date;
}): PropertyImageDto {
  return {
    id: row.id,
    propertyId: row.propertyId,
    imageUrl: row.imageUrl,
    storagePath: row.storagePath,
    displayOrder: row.displayOrder,
    isCover: row.isCover,
    uploadedAt: row.uploadedAt.toISOString(),
  };
}

export async function listPropertyImages(
  propertyId: string
): Promise<ServiceResult<PropertyImageDto[]>> {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, deletedAt: null },
    select: { id: true },
  });

  if (!property) {
    return { ok: false, error: { code: "NOT_FOUND", message: "Property not found" } };
  }

  const images = await prisma.propertyImage.findMany({
    where: { propertyId },
    orderBy: { displayOrder: "asc" },
  });

  return { ok: true, data: images.map(mapImage) };
}

export async function uploadPropertyImages(
  propertyId: string,
  files: { buffer: Buffer; mimeType: string; fileName: string }[]
): Promise<ServiceResult<PropertyImageDto[]>> {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, deletedAt: null },
    select: { id: true },
  });

  if (!property) {
    return { ok: false, error: { code: "NOT_FOUND", message: "Property not found" } };
  }

  const existingCount = await prisma.propertyImage.count({ where: { propertyId } });
  if (existingCount + files.length > PROPERTY_IMAGE_LIMITS.maxImages) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: `Maximum ${PROPERTY_IMAGE_LIMITS.maxImages} images per property`,
      },
    };
  }

  for (const file of files) {
    if (file.buffer.length > PROPERTY_IMAGE_LIMITS.maxFileSizeBytes) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Each image must be 20MB or less",
        },
      };
    }
    if (
      !PROPERTY_IMAGE_LIMITS.allowedMimeTypes.includes(
        file.mimeType as (typeof PROPERTY_IMAGE_LIMITS.allowedMimeTypes)[number]
      )
    ) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Only JPG, JPEG, PNG, and WEBP images are allowed",
        },
      };
    }
  }

  const maxOrder = await prisma.propertyImage.aggregate({
    where: { propertyId },
    _max: { displayOrder: true },
  });
  let nextOrder = (maxOrder._max.displayOrder ?? -1) + 1;

  const hasCover =
    (await prisma.propertyImage.count({
      where: { propertyId, isCover: true },
    })) > 0;

  const created: PropertyImageDto[] = [];
  let assignCover = !hasCover;

  for (const file of files) {
    const { storagePath, publicUrl } = await uploadPropertyImageFile(
      propertyId,
      file.buffer,
      file.mimeType,
      file.fileName
    );

    const row = await prisma.propertyImage.create({
      data: {
        id: randomUUID(),
        propertyId,
        imageUrl: publicUrl,
        storagePath,
        displayOrder: nextOrder++,
        isCover: assignCover,
      },
    });

    assignCover = false;
    created.push(mapImage(row));
  }

  return { ok: true, data: created };
}

export async function deletePropertyImage(
  propertyId: string,
  imageId: string
): Promise<ServiceResult<{ deleted: true }>> {
  const image = await prisma.propertyImage.findFirst({
    where: { id: imageId, propertyId },
  });

  if (!image) {
    return { ok: false, error: { code: "NOT_FOUND", message: "Image not found" } };
  }

  try {
    if (!image.storagePath.startsWith("legacy/")) {
      await deletePropertyImageFile(image.storagePath);
    }
  } catch {
    /* storage cleanup best-effort */
  }

  await prisma.propertyImage.delete({ where: { id: imageId } });

  if (image.isCover) {
    const next = await prisma.propertyImage.findFirst({
      where: { propertyId },
      orderBy: { displayOrder: "asc" },
    });
    if (next) {
      await prisma.propertyImage.update({
        where: { id: next.id },
        data: { isCover: true },
      });
    }
  }

  return { ok: true, data: { deleted: true } };
}

export async function reorderPropertyImages(
  propertyId: string,
  orderedIds: string[]
): Promise<ServiceResult<PropertyImageDto[]>> {
  const images = await prisma.propertyImage.findMany({
    where: { propertyId },
    select: { id: true },
  });

  if (orderedIds.length !== images.length) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid image order payload" },
    };
  }

  const idSet = new Set(images.map((i) => i.id));
  if (!orderedIds.every((id) => idSet.has(id))) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Unknown image id in order list" },
    };
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.propertyImage.update({
        where: { id },
        data: { displayOrder: index },
      })
    )
  );

  return listPropertyImages(propertyId);
}

export async function setPropertyCoverImage(
  propertyId: string,
  imageId: string
): Promise<ServiceResult<PropertyImageDto>> {
  const image = await prisma.propertyImage.findFirst({
    where: { id: imageId, propertyId },
  });

  if (!image) {
    return { ok: false, error: { code: "NOT_FOUND", message: "Image not found" } };
  }

  await prisma.$transaction([
    prisma.propertyImage.updateMany({
      where: { propertyId },
      data: { isCover: false },
    }),
    prisma.propertyImage.update({
      where: { id: imageId },
      data: { isCover: true },
    }),
  ]);

  const updated = await prisma.propertyImage.findUniqueOrThrow({
    where: { id: imageId },
  });

  return { ok: true, data: mapImage(updated) };
}
