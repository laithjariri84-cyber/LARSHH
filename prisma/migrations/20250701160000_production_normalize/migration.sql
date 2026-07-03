-- Production normalization migration
-- Transforms Sprint 1 schema → normalized LARSSH production architecture
-- Safe on empty databases. With existing data, review backfill steps marked DATA MIGRATION.

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. NEW ENUMS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TYPE "UserRole" AS ENUM ('AGENT', 'MANAGER', 'ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INVITED');
CREATE TYPE "Purpose" AS ENUM ('FOR_SALE', 'FOR_RENT', 'FOR_LEASE', 'HOLIDAY_RENTAL', 'INVESTMENT');
CREATE TYPE "LeaseStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED');

ALTER TYPE "MarketStatisticsScope" ADD VALUE IF NOT EXISTS 'MASTER_COMMUNITY';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. ORGANIZATION & USERS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "default_currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");

-- Default organization (DATA MIGRATION: customize for your brokerage)
INSERT INTO "organizations" ("id", "name", "slug", "updated_at")
VALUES ('00000000-0000-4000-8000-000000000001', 'ParagonOS', 'paragonos', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_organization_id_idx" ON "users"("organization_id");
CREATE INDEX "users_organization_id_status_idx" ON "users"("organization_id", "status");

ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DATA MIGRATION: profiles → users
INSERT INTO "users" ("id", "organization_id", "email", "full_name", "avatar_url", "status", "created_at", "updated_at")
SELECT
  p."id",
  '00000000-0000-4000-8000-000000000001',
  p."email",
  p."full_name",
  p."avatar_url",
  'ACTIVE'::"UserStatus",
  p."created_at",
  p."updated_at"
FROM "profiles" p
ON CONFLICT ("id") DO NOTHING;

CREATE TABLE "user_role_assignments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "UserRole" NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_role_assignments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_role_assignments_user_id_role_key" ON "user_role_assignments"("user_id", "role");
CREATE INDEX "user_role_assignments_user_id_idx" ON "user_role_assignments"("user_id");
CREATE INDEX "user_role_assignments_role_idx" ON "user_role_assignments"("role");

ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DATA MIGRATION: assign AGENT role to users linked to agents
INSERT INTO "user_role_assignments" ("id", "user_id", "role")
SELECT gen_random_uuid(), a."profile_id", 'AGENT'::"UserRole"
FROM "agents" a
WHERE a."profile_id" IS NOT NULL
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. MASTER COMMUNITY HIERARCHY
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE "master_communities" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "postal_code" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "master_communities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "master_communities_slug_key" ON "master_communities"("slug");
CREATE INDEX "master_communities_organization_id_idx" ON "master_communities"("organization_id");
CREATE INDEX "master_communities_organization_id_name_idx" ON "master_communities"("organization_id", "name");
CREATE INDEX "master_communities_city_state_idx" ON "master_communities"("city", "state");

ALTER TABLE "master_communities" ADD CONSTRAINT "master_communities_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DATA MIGRATION: create master from top-level communities or master_name
INSERT INTO "master_communities" (
  "id", "organization_id", "name", "slug", "description", "city", "state", "country",
  "postal_code", "latitude", "longitude", "metadata", "created_at", "updated_at"
)
SELECT
  COALESCE(c."parent_community_id", c."id"),
  '00000000-0000-4000-8000-000000000001',
  COALESCE(c."master_name", c."name"),
  COALESCE(c."master_name", c."slug") || '-master',
  c."description",
  c."city",
  c."state",
  c."country",
  c."postal_code",
  c."latitude",
  c."longitude",
  c."metadata",
  c."created_at",
  c."updated_at"
FROM "communities" c
WHERE c."parent_community_id" IS NULL
ON CONFLICT DO NOTHING;

-- Fallback: if no top-level rows, promote each community to its own master
INSERT INTO "master_communities" (
  "id", "organization_id", "name", "slug", "description", "city", "state", "country",
  "postal_code", "latitude", "longitude", "metadata", "created_at", "updated_at"
)
SELECT
  c."id",
  '00000000-0000-4000-8000-000000000001',
  COALESCE(c."master_name", c."name"),
  c."slug" || '-master',
  c."description",
  c."city",
  c."state",
  c."country",
  c."postal_code",
  c."latitude",
  c."longitude",
  c."metadata",
  c."created_at",
  c."updated_at"
FROM "communities" c
WHERE NOT EXISTS (SELECT 1 FROM "master_communities" mc WHERE mc."id" = c."id")
ON CONFLICT DO NOTHING;

ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "master_community_id" UUID;

UPDATE "communities" c
SET "master_community_id" = COALESCE(c."parent_community_id", c."id")
WHERE c."master_community_id" IS NULL;

UPDATE "communities" c
SET "master_community_id" = (SELECT mc."id" FROM "master_communities" mc LIMIT 1)
WHERE c."master_community_id" IS NULL;

ALTER TABLE "communities" ALTER COLUMN "master_community_id" SET NOT NULL;

ALTER TABLE "communities" DROP CONSTRAINT IF EXISTS "communities_parent_community_id_fkey";
ALTER TABLE "communities" DROP COLUMN IF EXISTS "parent_community_id";
ALTER TABLE "communities" DROP COLUMN IF EXISTS "master_name";

DROP INDEX IF EXISTS "communities_master_name_name_idx";
DROP INDEX IF EXISTS "communities_slug_key";

CREATE UNIQUE INDEX "communities_master_community_id_slug_key" ON "communities"("master_community_id", "slug");
CREATE INDEX "communities_master_community_id_idx" ON "communities"("master_community_id");
CREATE INDEX "communities_master_community_id_name_idx" ON "communities"("master_community_id", "name");

ALTER TABLE "communities" ADD CONSTRAINT "communities_master_community_id_fkey"
  FOREIGN KEY ("master_community_id") REFERENCES "master_communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "buildings_community_id_code_idx" ON "buildings"("community_id", "code");

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. AGENTS → USERS (remove duplicate identity fields)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "user_id" UUID;

-- DATA MIGRATION: link agent to user via profile
UPDATE "agents" a
SET "user_id" = a."profile_id"
WHERE a."user_id" IS NULL AND a."profile_id" IS NOT NULL;

-- DATA MIGRATION: agents without profile — create users from agent email
INSERT INTO "users" ("id", "organization_id", "email", "full_name", "status", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  '00000000-0000-4000-8000-000000000001',
  a."email",
  a."full_name",
  'ACTIVE'::"UserStatus",
  a."created_at",
  a."updated_at"
FROM "agents" a
WHERE a."user_id" IS NULL
ON CONFLICT ("email") DO NOTHING;

UPDATE "agents" a
SET "user_id" = u."id"
FROM "users" u
WHERE a."user_id" IS NULL AND u."email" = a."email";

INSERT INTO "user_role_assignments" ("id", "user_id", "role")
SELECT gen_random_uuid(), a."user_id", 'AGENT'::"UserRole"
FROM "agents" a
WHERE a."user_id" IS NOT NULL
ON CONFLICT DO NOTHING;

ALTER TABLE "agents" DROP CONSTRAINT IF EXISTS "agents_profile_id_fkey";
ALTER TABLE "agents" DROP COLUMN IF EXISTS "profile_id";
ALTER TABLE "agents" DROP COLUMN IF EXISTS "email";
ALTER TABLE "agents" DROP COLUMN IF EXISTS "full_name";

ALTER TABLE "agents" ALTER COLUMN "user_id" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "agents_user_id_key" ON "agents"("user_id");
CREATE INDEX IF NOT EXISTS "agents_user_id_idx" ON "agents"("user_id");

ALTER TABLE "agents" ADD CONSTRAINT "agents_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. EXTERNAL PARTIES — remove profile links
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE "owners" DROP CONSTRAINT IF EXISTS "owners_profile_id_fkey";
ALTER TABLE "owners" DROP COLUMN IF EXISTS "profile_id";
CREATE INDEX IF NOT EXISTS "owners_email_idx" ON "owners"("email");

ALTER TABLE "buyers" DROP CONSTRAINT IF EXISTS "buyers_profile_id_fkey";
ALTER TABLE "buyers" DROP COLUMN IF EXISTS "profile_id";
CREATE INDEX IF NOT EXISTS "buyers_email_idx" ON "buyers"("email");

ALTER TABLE "tenants" DROP CONSTRAINT IF EXISTS "tenants_profile_id_fkey";
ALTER TABLE "tenants" DROP COLUMN IF EXISTS "profile_id";
CREATE INDEX IF NOT EXISTS "tenants_email_idx" ON "tenants"("email");

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. PURPOSE (replaces ListingType)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "purpose" "Purpose";
CREATE INDEX IF NOT EXISTS "properties_purpose_idx" ON "properties"("purpose");

ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "purpose" "Purpose";

UPDATE "listings"
SET "purpose" = CASE
  WHEN "listing_type" = 'SALE' THEN 'FOR_SALE'::"Purpose"
  WHEN "listing_type" = 'RENT' THEN 'FOR_RENT'::"Purpose"
  ELSE 'FOR_SALE'::"Purpose"
END
WHERE "purpose" IS NULL;

ALTER TABLE "listings" ALTER COLUMN "purpose" SET NOT NULL;

ALTER TABLE "listings" DROP COLUMN IF EXISTS "listing_type";

DROP INDEX IF EXISTS "listings_listing_type_status_list_price_idx";
CREATE INDEX IF NOT EXISTS "listings_purpose_status_list_price_idx"
  ON "listings"("purpose", "status", "list_price");

DROP TYPE IF EXISTS "ListingType";

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. PROPERTY MEDIA & NOTES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "document_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime_type" TEXT,
    "uploaded_by_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "documents_property_id_document_type_idx" ON "documents"("property_id", "document_type");
CREATE INDEX "documents_property_id_created_at_idx" ON "documents"("property_id", "created_at" DESC);

ALTER TABLE "documents" ADD CONSTRAINT "documents_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_user_id_fkey"
  FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "photos" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "mime_type" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "photos_property_id_sort_order_idx" ON "photos"("property_id", "sort_order");
CREATE INDEX "photos_property_id_is_primary_idx" ON "photos"("property_id", "is_primary");

ALTER TABLE "photos" ADD CONSTRAINT "photos_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "poster_url" TEXT,
    "caption" TEXT,
    "duration_seconds" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "videos_property_id_sort_order_idx" ON "videos"("property_id", "sort_order");

ALTER TABLE "videos" ADD CONSTRAINT "videos_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "floor_plans" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "page_count" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "floor_plans_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "floor_plans_property_id_sort_order_idx" ON "floor_plans"("property_id", "sort_order");

ALTER TABLE "floor_plans" ADD CONSTRAINT "floor_plans_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "property_notes" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "author_user_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "property_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "property_notes_property_id_created_at_idx" ON "property_notes"("property_id", "created_at" DESC);
CREATE INDEX "property_notes_property_id_is_pinned_idx" ON "property_notes"("property_id", "is_pinned");

ALTER TABLE "property_notes" ADD CONSTRAINT "property_notes_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "property_notes" ADD CONSTRAINT "property_notes_author_user_id_fkey"
  FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. LEASES (Tenant → Leases)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE "leases" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "listing_id" UUID,
    "status" "LeaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "annual_rent" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "leases_property_id_status_idx" ON "leases"("property_id", "status");
CREATE INDEX "leases_tenant_id_status_idx" ON "leases"("tenant_id", "status");
CREATE INDEX "leases_start_date_end_date_idx" ON "leases"("start_date", "end_date");

ALTER TABLE "leases" ADD CONSTRAINT "leases_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leases" ADD CONSTRAINT "leases_listing_id_fkey"
  FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "deals_buyer_id_status_idx" ON "deals"("buyer_id", "status");

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. TASKS — re-point assignee from profiles to users
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_assignee_user_id_fkey";

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_user_id_fkey"
  FOREIGN KEY ("assignee_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. OFFERS — drop inline notes (use PropertyNote on property)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE "offers" DROP COLUMN IF EXISTS "notes";

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. DROP LEGACY profiles TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "profiles_pkey";
DROP TABLE IF EXISTS "profiles";
