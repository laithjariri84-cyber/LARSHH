-- Final production schema — PF Expert import + Salesforce sync readiness
-- Builds on: init → sprint1 → production_normalize → import_listing_fields

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. LISTING TYPE (Rent or Sale)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT');

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. PROPERTY — permanent asset fields + denormalized location FKs
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "master_community_id" UUID;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "community_id" UUID;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10,7);
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(10,7);
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "salesforce_id" TEXT;

-- Rename square_feet → area_sqft
ALTER TABLE "properties" RENAME COLUMN "square_feet" TO "area_sqft";

-- Backfill denormalized location FKs from building → community → master
UPDATE "properties" p
SET
  "community_id" = b."community_id",
  "master_community_id" = c."master_community_id"
FROM "buildings" b
JOIN "communities" c ON c."id" = b."community_id"
WHERE p."building_id" = b."id"
  AND (p."community_id" IS NULL OR p."master_community_id" IS NULL);

ALTER TABLE "properties" ALTER COLUMN "master_community_id" SET NOT NULL;
ALTER TABLE "properties" ALTER COLUMN "community_id" SET NOT NULL;

ALTER TABLE "properties" ALTER COLUMN "owner_id" DROP NOT NULL;

-- Remove dynamic fields from permanent asset table
ALTER TABLE "properties" DROP COLUMN IF EXISTS "purpose";
ALTER TABLE "properties" DROP COLUMN IF EXISTS "status";
ALTER TABLE "properties" DROP COLUMN IF EXISTS "is_holiday_home";

DROP INDEX IF EXISTS "properties_purpose_idx";
DROP INDEX IF EXISTS "properties_building_id_status_idx";

ALTER TABLE "properties" ADD CONSTRAINT "properties_master_community_id_fkey"
  FOREIGN KEY ("master_community_id") REFERENCES "master_communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "properties" ADD CONSTRAINT "properties_community_id_fkey"
  FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "properties_salesforce_id_key" ON "properties"("salesforce_id");
CREATE INDEX IF NOT EXISTS "properties_master_community_id_idx" ON "properties"("master_community_id");
CREATE INDEX IF NOT EXISTS "properties_community_id_idx" ON "properties"("community_id");
CREATE INDEX IF NOT EXISTS "properties_community_id_bedrooms_idx" ON "properties"("community_id", "bedrooms");
CREATE INDEX IF NOT EXISTS "properties_building_id_bedrooms_idx" ON "properties"("building_id", "bedrooms");
CREATE INDEX IF NOT EXISTS "properties_bedrooms_idx" ON "properties"("bedrooms");
CREATE INDEX IF NOT EXISTS "properties_salesforce_id_idx" ON "properties"("salesforce_id");

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. LISTING — dynamic market fields (PF Expert + Salesforce)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "listing_type" "ListingType";
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "salesforce_id" TEXT;

-- Migrate purpose → listing_type
UPDATE "listings"
SET "listing_type" = CASE
  WHEN "purpose" IN ('FOR_SALE', 'INVESTMENT') THEN 'SALE'::"ListingType"
  WHEN "purpose" IN ('FOR_RENT', 'FOR_LEASE', 'HOLIDAY_RENTAL') THEN 'RENT'::"ListingType"
  ELSE 'SALE'::"ListingType"
END
WHERE "listing_type" IS NULL;

ALTER TABLE "listings" ALTER COLUMN "listing_type" SET NOT NULL;

-- Rename columns to production names
ALTER TABLE "listings" RENAME COLUMN "title" TO "marketing_title";
ALTER TABLE "listings" RENAME COLUMN "list_price" TO "asking_price";
ALTER TABLE "listings" RENAME COLUMN "listed_at" TO "published_at";

-- PF Expert reference (rename from generic external_reference)
ALTER TABLE "listings" RENAME COLUMN "external_reference" TO "pf_expert_reference";

ALTER TABLE "listings" DROP COLUMN IF EXISTS "purpose";
ALTER TABLE "listings" DROP COLUMN IF EXISTS "import_source";

DROP INDEX IF EXISTS "listings_purpose_status_list_price_idx";
DROP INDEX IF EXISTS "listings_import_source_idx";
DROP INDEX IF EXISTS "listings_external_reference_idx";
DROP INDEX IF EXISTS "listings_external_reference_key";

CREATE UNIQUE INDEX IF NOT EXISTS "listings_pf_expert_reference_key"
  ON "listings"("pf_expert_reference");
CREATE UNIQUE INDEX IF NOT EXISTS "listings_salesforce_id_key"
  ON "listings"("salesforce_id");

CREATE INDEX IF NOT EXISTS "listings_status_idx" ON "listings"("status");
CREATE INDEX IF NOT EXISTS "listings_status_asking_price_idx" ON "listings"("status", "asking_price");
CREATE INDEX IF NOT EXISTS "listings_listing_type_status_asking_price_idx"
  ON "listings"("listing_type", "status", "asking_price");
CREATE INDEX IF NOT EXISTS "listings_asking_price_idx" ON "listings"("asking_price");
CREATE INDEX IF NOT EXISTS "listings_pf_expert_reference_idx" ON "listings"("pf_expert_reference");
CREATE INDEX IF NOT EXISTS "listings_salesforce_id_idx" ON "listings"("salesforce_id");
CREATE INDEX IF NOT EXISTS "listings_expires_at_idx" ON "listings"("expires_at");

-- Drop Purpose enum if no longer referenced
DROP TYPE IF EXISTS "Purpose";

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. LOCATION ENTITIES — integration refs for hierarchical import
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE "master_communities" ADD COLUMN IF NOT EXISTS "pf_expert_ref" TEXT;
ALTER TABLE "master_communities" ADD COLUMN IF NOT EXISTS "salesforce_id" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "master_communities_pf_expert_ref_key" ON "master_communities"("pf_expert_ref");
CREATE UNIQUE INDEX IF NOT EXISTS "master_communities_salesforce_id_key" ON "master_communities"("salesforce_id");

ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "pf_expert_ref" TEXT;
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "salesforce_id" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "communities_pf_expert_ref_key" ON "communities"("pf_expert_ref");
CREATE UNIQUE INDEX IF NOT EXISTS "communities_salesforce_id_key" ON "communities"("salesforce_id");

ALTER TABLE "buildings" ADD COLUMN IF NOT EXISTS "pf_expert_ref" TEXT;
ALTER TABLE "buildings" ADD COLUMN IF NOT EXISTS "salesforce_id" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "buildings_pf_expert_ref_key" ON "buildings"("pf_expert_ref");
CREATE UNIQUE INDEX IF NOT EXISTS "buildings_salesforce_id_key" ON "buildings"("salesforce_id");

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. SALESFORCE IDs on CRM entities (future sync)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "salesforce_id" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "agents_salesforce_id_key" ON "agents"("salesforce_id");

ALTER TABLE "owners" ADD COLUMN IF NOT EXISTS "salesforce_id" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "owners_salesforce_id_key" ON "owners"("salesforce_id");

ALTER TABLE "buyers" ADD COLUMN IF NOT EXISTS "salesforce_id" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "buyers_salesforce_id_key" ON "buyers"("salesforce_id");

ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "salesforce_id" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "tenants_salesforce_id_key" ON "tenants"("salesforce_id");

ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "salesforce_id" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "deals_salesforce_id_key" ON "deals"("salesforce_id");

-- Default currency to AED for UAE brokerage (existing rows)
ALTER TABLE "listings" ALTER COLUMN "currency" SET DEFAULT 'AED';
ALTER TABLE "deals" ALTER COLUMN "currency" SET DEFAULT 'AED';
ALTER TABLE "leases" ALTER COLUMN "currency" SET DEFAULT 'AED';
ALTER TABLE "price_history" ALTER COLUMN "currency" SET DEFAULT 'AED';
