-- CreateEnum
CREATE TYPE "MarketDemandLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "community_market_intelligence" (
    "id" UUID NOT NULL,
    "community_slug" TEXT NOT NULL,
    "community_name" TEXT NOT NULL,
    "bedroom_count" INTEGER NOT NULL,
    "rent_furnished_min" DECIMAL(12,2),
    "rent_furnished_avg" DECIMAL(12,2),
    "rent_furnished_max" DECIMAL(12,2),
    "rent_furnished_estimated" BOOLEAN NOT NULL DEFAULT false,
    "rent_unfurnished_min" DECIMAL(12,2),
    "rent_unfurnished_avg" DECIMAL(12,2),
    "rent_unfurnished_max" DECIMAL(12,2),
    "rent_unfurnished_estimated" BOOLEAN NOT NULL DEFAULT false,
    "sale_asking_lowest" DECIMAL(12,2),
    "sale_asking_avg" DECIMAL(12,2),
    "sale_asking_highest" DECIMAL(12,2),
    "sale_asking_estimated" BOOLEAN NOT NULL DEFAULT false,
    "sale_sold_lowest" DECIMAL(12,2),
    "sale_sold_avg" DECIMAL(12,2),
    "sale_sold_highest" DECIMAL(12,2),
    "sale_sold_estimated" BOOLEAN NOT NULL DEFAULT false,
    "average_size_sqft" DECIMAL(10,2),
    "average_price_per_sqft" DECIMAL(10,2),
    "estimated_roi_percent" DECIMAL(5,2),
    "demand" "MarketDemandLevel",
    "confidence_percent" DECIMAL(5,2),
    "is_estimated" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_market_intelligence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_market_intelligence_community_slug_bedroom_count_key" ON "community_market_intelligence"("community_slug", "bedroom_count");

-- CreateIndex
CREATE INDEX "community_market_intelligence_community_slug_idx" ON "community_market_intelligence"("community_slug");
