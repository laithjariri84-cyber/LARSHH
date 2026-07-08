-- CreateEnum
CREATE TYPE "IntelligenceUnitCategory" AS ENUM ('STUDIO', 'ONE_BEDROOM', 'TWO_BEDROOM', 'THREE_BEDROOM', 'FOUR_BEDROOM', 'TOWNHOUSE', 'VILLA');

-- CreateTable
CREATE TABLE "community_intelligence_cms" (
    "id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "community_name" TEXT NOT NULL,
    "overview" TEXT,
    "investment_summary" TEXT,
    "best_for" TEXT,
    "pros" JSONB,
    "cons" JSONB,
    "market_notes" TEXT,
    "average_sale_price_aed" DECIMAL(14,2),
    "average_rent_aed_year" DECIMAL(14,2),
    "average_price_per_sqft_aed" DECIMAL(10,2),
    "average_roi_percent" DECIMAL(5,2),
    "capital_appreciation_percent" DECIMAL(5,2),
    "rental_demand" "MarketDemandLevel",
    "occupancy_rate_percent" DECIMAL(5,2),
    "luxury_score" INTEGER,
    "family_score" INTEGER,
    "investment_score" INTEGER,
    "lifestyle_score" INTEGER,
    "walkability" TEXT,
    "beach_access" TEXT,
    "short_term_rental_score" INTEGER,
    "long_term_rental_score" INTEGER,
    "nearby_schools" JSONB,
    "nearby_hospitals" JSONB,
    "nearby_restaurants" JSONB,
    "nearby_supermarkets" JSONB,
    "nearby_hotels" JSONB,
    "nearby_shopping" JSONB,
    "hidden_market_insights" TEXT,
    "future_developments" TEXT,
    "things_buyers_should_know" TEXT,
    "things_investors_should_know" TEXT,
    "updated_by_email" TEXT,
    "updated_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_intelligence_cms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_intelligence_unit_benchmarks" (
    "id" UUID NOT NULL,
    "cms_id" UUID NOT NULL,
    "unit_type" "IntelligenceUnitCategory" NOT NULL,
    "average_sale_price_aed" DECIMAL(14,2),
    "average_rent_aed_year" DECIMAL(14,2),
    "average_price_per_sqft_aed" DECIMAL(10,2),

    CONSTRAINT "community_intelligence_unit_benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_intelligence_cms_community_id_key" ON "community_intelligence_cms"("community_id");

-- CreateIndex
CREATE INDEX "community_intelligence_cms_community_name_idx" ON "community_intelligence_cms"("community_name");

-- CreateIndex
CREATE UNIQUE INDEX "community_intelligence_unit_benchmarks_cms_id_unit_type_key" ON "community_intelligence_unit_benchmarks"("cms_id", "unit_type");

-- AddForeignKey
ALTER TABLE "community_intelligence_cms" ADD CONSTRAINT "community_intelligence_cms_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_intelligence_unit_benchmarks" ADD CONSTRAINT "community_intelligence_unit_benchmarks_cms_id_fkey" FOREIGN KEY ("cms_id") REFERENCES "community_intelligence_cms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
