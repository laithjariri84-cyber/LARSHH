-- Sprint 1: Property domain — extended schema for Backend Sprint 1
-- Apply after init migration on Supabase PostgreSQL

-- New enums
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED', 'COUNTERED');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
CREATE TYPE "MarketStatisticsScope" AS ENUM ('COMMUNITY', 'BUILDING', 'PROPERTY', 'PROPERTY_TYPE', 'REGION');
CREATE TYPE "MarketStatisticsPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- Communities
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "parent_community_id" UUID;
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "master_name" TEXT;
ALTER TABLE "communities" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

CREATE INDEX IF NOT EXISTS "communities_master_name_name_idx" ON "communities"("master_name", "name");

ALTER TABLE "communities" ADD CONSTRAINT "communities_parent_community_id_fkey"
  FOREIGN KEY ("parent_community_id") REFERENCES "communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Buildings
ALTER TABLE "buildings" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "buildings" ADD COLUMN IF NOT EXISTS "total_units" INTEGER;

CREATE INDEX IF NOT EXISTS "buildings_community_id_name_idx" ON "buildings"("community_id", "name");

-- Properties
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "property_code" TEXT;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "is_holiday_home" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

UPDATE "properties" SET "property_code" = 'PROP-' || LEFT("id"::text, 8) WHERE "property_code" IS NULL;

ALTER TABLE "properties" ALTER COLUMN "property_code" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "properties_property_code_key" ON "properties"("property_code");
CREATE INDEX IF NOT EXISTS "properties_property_code_idx" ON "properties"("property_code");
CREATE INDEX IF NOT EXISTS "properties_property_type_bedrooms_idx" ON "properties"("property_type", "bedrooms");
CREATE INDEX IF NOT EXISTS "properties_building_id_status_idx" ON "properties"("building_id", "status");
CREATE INDEX IF NOT EXISTS "properties_deleted_at_idx" ON "properties"("deleted_at");

-- Listings
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "days_on_market" INTEGER;
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "price_per_sqft" DECIMAL(10,2);
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "market_difference_percent" DECIMAL(6,2);
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "listings_property_id_status_idx" ON "listings"("property_id", "status");
CREATE INDEX IF NOT EXISTS "listings_listing_type_status_list_price_idx" ON "listings"("listing_type", "status", "list_price");
CREATE INDEX IF NOT EXISTS "listings_listed_at_idx" ON "listings"("listed_at" DESC);
CREATE INDEX IF NOT EXISTS "listings_deleted_at_idx" ON "listings"("deleted_at");

-- Deals: property_id denormalized
ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "property_id" UUID;

UPDATE "deals" d SET "property_id" = l."property_id"
FROM "listings" l WHERE d."listing_id" = l."id" AND d."property_id" IS NULL;

ALTER TABLE "deals" ALTER COLUMN "property_id" SET NOT NULL;

ALTER TABLE "deals" ADD CONSTRAINT "deals_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "deals_property_id_status_idx" ON "deals"("property_id", "status");

-- Viewings: property_id denormalized
ALTER TABLE "viewings" ADD COLUMN IF NOT EXISTS "property_id" UUID;

UPDATE "viewings" v SET "property_id" = l."property_id"
FROM "listings" l WHERE v."listing_id" = l."id" AND v."property_id" IS NULL;

ALTER TABLE "viewings" ALTER COLUMN "property_id" SET NOT NULL;

ALTER TABLE "viewings" ADD CONSTRAINT "viewings_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "viewings_property_id_scheduled_at_idx" ON "viewings"("property_id", "scheduled_at");
CREATE INDEX IF NOT EXISTS "viewings_status_scheduled_at_idx" ON "viewings"("status", "scheduled_at");

-- Offers
CREATE TABLE IF NOT EXISTS "offers" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "deal_id" UUID,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "offer_price" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "expires_at" TIMESTAMP(3),
    "notes" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "offers_deal_id_key" ON "offers"("deal_id");
CREATE INDEX IF NOT EXISTS "offers_property_id_status_idx" ON "offers"("property_id", "status");
CREATE INDEX IF NOT EXISTS "offers_listing_id_idx" ON "offers"("listing_id");
CREATE INDEX IF NOT EXISTS "offers_buyer_id_idx" ON "offers"("buyer_id");
CREATE INDEX IF NOT EXISTS "offers_agent_id_idx" ON "offers"("agent_id");
CREATE INDEX IF NOT EXISTS "offers_submitted_at_idx" ON "offers"("submitted_at" DESC);

ALTER TABLE "offers" ADD CONSTRAINT "offers_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "offers" ADD CONSTRAINT "offers_listing_id_fkey"
  FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "offers" ADD CONSTRAINT "offers_buyer_id_fkey"
  FOREIGN KEY ("buyer_id") REFERENCES "buyers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "offers" ADD CONSTRAINT "offers_agent_id_fkey"
  FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "offers" ADD CONSTRAINT "offers_deal_id_fkey"
  FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Tasks
CREATE TABLE IF NOT EXISTS "tasks" (
    "id" UUID NOT NULL,
    "property_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignee_user_id" UUID,
    "assignee_agent_id" UUID,
    "related_entity_type" TEXT,
    "related_entity_id" UUID,
    "due_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "tasks_property_id_status_idx" ON "tasks"("property_id", "status");
CREATE INDEX IF NOT EXISTS "tasks_assignee_user_id_status_due_at_idx" ON "tasks"("assignee_user_id", "status", "due_at");
CREATE INDEX IF NOT EXISTS "tasks_assignee_agent_id_status_due_at_idx" ON "tasks"("assignee_agent_id", "status", "due_at");
CREATE INDEX IF NOT EXISTS "tasks_due_at_idx" ON "tasks"("due_at");

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_user_id_fkey"
  FOREIGN KEY ("assignee_user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_agent_id_fkey"
  FOREIGN KEY ("assignee_agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Price history
CREATE TABLE IF NOT EXISTS "price_history" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "listing_id" UUID,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "price_history_property_id_recorded_at_idx" ON "price_history"("property_id", "recorded_at" DESC);
CREATE INDEX IF NOT EXISTS "price_history_listing_id_recorded_at_idx" ON "price_history"("listing_id", "recorded_at" DESC);

ALTER TABLE "price_history" ADD CONSTRAINT "price_history_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_listing_id_fkey"
  FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Market statistics
CREATE TABLE IF NOT EXISTS "market_statistics" (
    "id" UUID NOT NULL,
    "scope_type" "MarketStatisticsScope" NOT NULL,
    "scope_id" UUID NOT NULL,
    "property_id" UUID,
    "period" "MarketStatisticsPeriod" NOT NULL,
    "period_start" DATE NOT NULL,
    "avg_asking_price" DECIMAL(12,2),
    "avg_price_per_sqft" DECIMAL(10,2),
    "avg_rent" DECIMAL(12,2),
    "avg_roi" DECIMAL(5,2),
    "avg_days_on_market" INTEGER,
    "median_price" DECIMAL(12,2),
    "lowest_price" DECIMAL(12,2),
    "highest_price" DECIMAL(12,2),
    "supply_level" TEXT,
    "demand_level" TEXT,
    "market_confidence" DECIMAL(5,2),
    "active_listings_count" INTEGER NOT NULL DEFAULT 0,
    "sample_size" INTEGER NOT NULL DEFAULT 0,
    "computed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "market_statistics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "market_statistics_scope_type_scope_id_period_period_start_key"
  ON "market_statistics"("scope_type", "scope_id", "period", "period_start");
CREATE INDEX IF NOT EXISTS "market_statistics_property_id_period_start_idx"
  ON "market_statistics"("property_id", "period_start" DESC);
CREATE INDEX IF NOT EXISTS "market_statistics_scope_type_scope_id_period_idx"
  ON "market_statistics"("scope_type", "scope_id", "period");

ALTER TABLE "market_statistics" ADD CONSTRAINT "market_statistics_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Comparable properties
CREATE TABLE IF NOT EXISTS "comparable_properties" (
    "id" UUID NOT NULL,
    "subject_property_id" UUID NOT NULL,
    "subject_listing_id" UUID,
    "comp_property_id" UUID NOT NULL,
    "comp_listing_id" UUID,
    "similarity_score" DECIMAL(5,2) NOT NULL,
    "price_difference_pct" DECIMAL(6,2),
    "distance_meters" INTEGER,
    "matched_on" TEXT[],
    "computed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comparable_properties_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "comparable_properties_subject_property_id_similarity_score_idx"
  ON "comparable_properties"("subject_property_id", "similarity_score" DESC);
CREATE INDEX IF NOT EXISTS "comparable_properties_comp_property_id_idx"
  ON "comparable_properties"("comp_property_id");

ALTER TABLE "comparable_properties" ADD CONSTRAINT "comparable_properties_subject_property_id_fkey"
  FOREIGN KEY ("subject_property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comparable_properties" ADD CONSTRAINT "comparable_properties_comp_property_id_fkey"
  FOREIGN KEY ("comp_property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comparable_properties" ADD CONSTRAINT "comparable_properties_subject_listing_id_fkey"
  FOREIGN KEY ("subject_listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "comparable_properties" ADD CONSTRAINT "comparable_properties_comp_listing_id_fkey"
  FOREIGN KEY ("comp_listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
