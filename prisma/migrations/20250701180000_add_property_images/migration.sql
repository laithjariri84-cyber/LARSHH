-- Property images table for Supabase Storage-backed gallery
CREATE TABLE "property_images" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "property_images_property_id_display_order_idx" ON "property_images"("property_id", "display_order");
CREATE INDEX "property_images_property_id_is_cover_idx" ON "property_images"("property_id", "is_cover");

ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_fkey"
    FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate legacy photos rows when present
INSERT INTO "property_images" ("id", "property_id", "image_url", "storage_path", "display_order", "is_cover", "uploaded_at")
SELECT
    "id",
    "property_id",
    "url",
    COALESCE(NULLIF("url", ''), 'legacy/' || "id"::text),
    "sort_order",
    "is_primary",
    "created_at"
FROM "photos"
ON CONFLICT ("id") DO NOTHING;
