-- Import engine: listing quality score and external reference tracking
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "quality_score" DECIMAL(5,2);
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "external_reference" TEXT;
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "import_source" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "listings_external_reference_key"
  ON "listings"("external_reference");

CREATE INDEX IF NOT EXISTS "listings_import_source_idx"
  ON "listings"("import_source");

CREATE INDEX IF NOT EXISTS "listings_external_reference_idx"
  ON "listings"("external_reference");
