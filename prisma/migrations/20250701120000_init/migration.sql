-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'VILLA', 'TOWNHOUSE', 'PENTHOUSE', 'OFFICE', 'RETAIL', 'WAREHOUSE', 'LAND', 'OTHER');
CREATE TYPE "PropertyStatus" AS ENUM ('VACANT', 'OCCUPIED', 'UNDER_RENOVATION', 'OFF_MARKET');
CREATE TYPE "Furnishing" AS ENUM ('UNFURNISHED', 'PARTIALLY_FURNISHED', 'FULLY_FURNISHED');
CREATE TYPE "ViewType" AS ENUM ('SEA', 'CITY', 'GARDEN', 'POOL', 'STREET', 'COURTYARD', 'PARK', 'OTHER');
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT');
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PENDING', 'SOLD', 'RENTED', 'WITHDRAWN', 'EXPIRED');
CREATE TYPE "DealStatus" AS ENUM ('INQUIRY', 'VIEWING', 'OFFER', 'NEGOTIATION', 'UNDER_CONTRACT', 'CLOSED', 'CANCELLED');
CREATE TYPE "ViewingStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "communities" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "postal_code" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "buildings" (
    "id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address_line1" TEXT NOT NULL,
    "address_line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "total_floors" INTEGER,
    "year_built" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "owners" (
    "id" UUID NOT NULL,
    "profile_id" UUID,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "full_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "properties" (
    "id" UUID NOT NULL,
    "building_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "unit_number" TEXT,
    "floor" INTEGER,
    "square_feet" DECIMAL(10,2),
    "bedrooms" INTEGER,
    "bathrooms" DECIMAL(3,1),
    "property_type" "PropertyType" NOT NULL,
    "furnishing" "Furnishing",
    "view" "ViewType",
    "status" "PropertyStatus" NOT NULL DEFAULT 'VACANT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agents" (
    "id" UUID NOT NULL,
    "profile_id" UUID,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "full_name" TEXT NOT NULL,
    "license_number" TEXT,
    "agency_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "buyers" (
    "id" UUID NOT NULL,
    "profile_id" UUID,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "full_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "profile_id" UUID,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "full_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "listings" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "list_price" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "listing_type" "ListingType" NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "listed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "sold_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "deals" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "status" "DealStatus" NOT NULL DEFAULT 'INQUIRY',
    "offer_price" DECIMAL(12,2),
    "agreed_price" DECIMAL(12,2),
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "viewings" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "agent_id" UUID NOT NULL,
    "buyer_id" UUID,
    "tenant_id" UUID,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "status" "ViewingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "viewings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");
CREATE UNIQUE INDEX "communities_slug_key" ON "communities"("slug");
CREATE INDEX "communities_city_state_idx" ON "communities"("city", "state");
CREATE INDEX "buildings_community_id_idx" ON "buildings"("community_id");
CREATE UNIQUE INDEX "owners_profile_id_key" ON "owners"("profile_id");
CREATE UNIQUE INDEX "owners_email_key" ON "owners"("email");
CREATE INDEX "properties_building_id_idx" ON "properties"("building_id");
CREATE INDEX "properties_owner_id_idx" ON "properties"("owner_id");
CREATE INDEX "properties_property_type_idx" ON "properties"("property_type");
CREATE INDEX "properties_bedrooms_idx" ON "properties"("bedrooms");
CREATE INDEX "properties_furnishing_idx" ON "properties"("furnishing");
CREATE INDEX "properties_view_idx" ON "properties"("view");
CREATE UNIQUE INDEX "agents_profile_id_key" ON "agents"("profile_id");
CREATE UNIQUE INDEX "agents_email_key" ON "agents"("email");
CREATE UNIQUE INDEX "buyers_profile_id_key" ON "buyers"("profile_id");
CREATE UNIQUE INDEX "buyers_email_key" ON "buyers"("email");
CREATE UNIQUE INDEX "tenants_profile_id_key" ON "tenants"("profile_id");
CREATE UNIQUE INDEX "tenants_email_key" ON "tenants"("email");
CREATE INDEX "listings_property_id_idx" ON "listings"("property_id");
CREATE INDEX "listings_agent_id_idx" ON "listings"("agent_id");
CREATE INDEX "listings_status_idx" ON "listings"("status");
CREATE INDEX "listings_listing_type_idx" ON "listings"("listing_type");
CREATE INDEX "listings_list_price_idx" ON "listings"("list_price");
CREATE INDEX "deals_listing_id_idx" ON "deals"("listing_id");
CREATE INDEX "deals_buyer_id_idx" ON "deals"("buyer_id");
CREATE INDEX "deals_agent_id_idx" ON "deals"("agent_id");
CREATE INDEX "deals_status_idx" ON "deals"("status");
CREATE INDEX "viewings_listing_id_idx" ON "viewings"("listing_id");
CREATE INDEX "viewings_agent_id_idx" ON "viewings"("agent_id");
CREATE INDEX "viewings_scheduled_at_idx" ON "viewings"("scheduled_at");

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "owners" ADD CONSTRAINT "owners_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "properties" ADD CONSTRAINT "properties_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "agents" ADD CONSTRAINT "agents_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "buyers" ADD CONSTRAINT "buyers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "deals" ADD CONSTRAINT "deals_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "deals" ADD CONSTRAINT "deals_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "buyers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "deals" ADD CONSTRAINT "deals_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "viewings" ADD CONSTRAINT "viewings_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "viewings" ADD CONSTRAINT "viewings_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "viewings" ADD CONSTRAINT "viewings_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "buyers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "viewings" ADD CONSTRAINT "viewings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
