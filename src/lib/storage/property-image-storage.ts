import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import { createClient } from "@supabase/supabase-js";

import { PROPERTY_IMAGE_LIMITS } from "@/lib/brand";

export type PropertyImageUploadResult = {
  storagePath: string;
  publicUrl: string;
};

export type PropertyImageStorageProvider = "supabase" | "local";

export function getPropertyImageStorageProvider(): PropertyImageStorageProvider {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return "supabase";
  }

  return "local";
}

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getSupabasePublicUrl(storagePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");

  return `${url}/storage/v1/object/public/${PROPERTY_IMAGE_LIMITS.storageBucket}/${storagePath}`;
}

async function ensureSupabaseBucket() {
  const supabase = createSupabaseAdmin();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(
    (b) => b.name === PROPERTY_IMAGE_LIMITS.storageBucket
  );

  if (!exists) {
    await supabase.storage.createBucket(PROPERTY_IMAGE_LIMITS.storageBucket, {
      public: true,
      fileSizeLimit: PROPERTY_IMAGE_LIMITS.maxFileSizeBytes,
      allowedMimeTypes: [...PROPERTY_IMAGE_LIMITS.allowedMimeTypes],
    });
  }
}

function getLocalAbsolutePath(storagePath: string): string {
  const relative = storagePath.replace(/^local\//, "");
  return path.join(process.cwd(), "public", "uploads", relative);
}

async function uploadToSupabase(
  propertyId: string,
  file: Buffer,
  mimeType: string,
  fileName: string
): Promise<PropertyImageUploadResult> {
  await ensureSupabaseBucket();
  const supabase = createSupabaseAdmin();

  const ext = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf("."))
    : ".jpg";
  const storagePath = `properties/${propertyId}/${crypto.randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from(PROPERTY_IMAGE_LIMITS.storageBucket)
    .upload(storagePath, file, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  return {
    storagePath,
    publicUrl: getSupabasePublicUrl(storagePath),
  };
}

async function uploadToLocal(
  propertyId: string,
  file: Buffer,
  fileName: string
): Promise<PropertyImageUploadResult> {
  const ext = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf("."))
    : ".jpg";
  const fileId = crypto.randomUUID();
  const storagePath = `local/properties/${propertyId}/${fileId}${ext}`;
  const absolutePath = getLocalAbsolutePath(storagePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, file);

  return {
    storagePath,
    publicUrl: `/uploads/properties/${propertyId}/${fileId}${ext}`,
  };
}

export async function uploadPropertyImageFile(
  propertyId: string,
  file: Buffer,
  mimeType: string,
  fileName: string
): Promise<PropertyImageUploadResult> {
  const provider = getPropertyImageStorageProvider();

  if (provider === "supabase") {
    return uploadToSupabase(propertyId, file, mimeType, fileName);
  }

  return uploadToLocal(propertyId, file, fileName);
}

export async function deletePropertyImageFile(storagePath: string) {
  if (storagePath.startsWith("legacy/")) {
    return;
  }

  if (storagePath.startsWith("local/")) {
    const absolutePath = getLocalAbsolutePath(storagePath);
    try {
      await unlink(absolutePath);
    } catch {
      /* file may already be removed */
    }
    return;
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.storage
    .from(PROPERTY_IMAGE_LIMITS.storageBucket)
    .remove([storagePath]);

  if (error) throw new Error(error.message);
}

export function getPublicStorageUrl(storagePath: string): string {
  if (storagePath.startsWith("local/")) {
    return storagePath.replace(/^local\//, "/uploads/");
  }

  return getSupabasePublicUrl(storagePath);
}
