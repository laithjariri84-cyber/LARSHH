import { ListingStatus, ListingType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { cacheDashboardMetrics } from "@/lib/server-cache";
import { rscTry } from "@/lib/rsc-debug";

import type { DashboardQueryScope } from "./dashboard.types";

export type DashboardMetrics = {
  activeListings: number;
  rentals: number;
  sales: number;
  communities: number;
  currentMonthListings: number;
  previousMonthListings: number;
  currentMonthRentals: number;
  previousMonthRentals: number;
  currentMonthSales: number;
  previousMonthSales: number;
  currentMonthCommunities: number;
  previousMonthCommunities: number;
};

type DashboardMetricsRow = {
  active_listings: number;
  rentals: number;
  sales: number;
  communities: number;
  current_month_listings: number;
  previous_month_listings: number;
  current_month_rentals: number;
  previous_month_rentals: number;
  current_month_sales: number;
  previous_month_sales: number;
  current_month_communities: number;
  previous_month_communities: number;
};

function mapDashboardMetricsRow(row: DashboardMetricsRow | undefined): DashboardMetrics {
  return {
    activeListings: row?.active_listings ?? 0,
    rentals: row?.rentals ?? 0,
    sales: row?.sales ?? 0,
    communities: row?.communities ?? 0,
    currentMonthListings: row?.current_month_listings ?? 0,
    previousMonthListings: row?.previous_month_listings ?? 0,
    currentMonthRentals: row?.current_month_rentals ?? 0,
    previousMonthRentals: row?.previous_month_rentals ?? 0,
    currentMonthSales: row?.current_month_sales ?? 0,
    previousMonthSales: row?.previous_month_sales ?? 0,
    currentMonthCommunities: row?.current_month_communities ?? 0,
    previousMonthCommunities: row?.previous_month_communities ?? 0,
  };
}

export async function queryDashboardMetrics(
  scope: DashboardQueryScope
): Promise<DashboardMetrics> {
  const agentClause = scope.agentId
    ? Prisma.sql`AND l.agent_id = ${scope.agentId}::uuid`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<DashboardMetricsRow[]>(Prisma.sql`
    WITH scoped_listings AS (
      SELECT
        l.listing_type,
        l.status,
        l.created_at,
        p.id AS property_id,
        p.community_id
      FROM listings l
      INNER JOIN properties p ON p.id = l.property_id
      WHERE l.deleted_at IS NULL
        AND p.deleted_at IS NULL
        ${agentClause}
    ),
    month_bounds AS (
      SELECT
        date_trunc('month', CURRENT_TIMESTAMP) AS curr_start,
        (date_trunc('month', CURRENT_TIMESTAMP) + INTERVAL '1 month' - INTERVAL '1 second') AS curr_end,
        date_trunc('month', CURRENT_TIMESTAMP - INTERVAL '1 month') AS prev_start,
        (date_trunc('month', CURRENT_TIMESTAMP) - INTERVAL '1 second') AS prev_end
    )
    SELECT
      COUNT(DISTINCT sl.property_id) FILTER (
        WHERE sl.status = ${ListingStatus.ACTIVE}
      )::int AS active_listings,
      COUNT(DISTINCT sl.property_id) FILTER (
        WHERE sl.listing_type = ${ListingType.RENT}
      )::int AS rentals,
      COUNT(DISTINCT sl.property_id) FILTER (
        WHERE sl.listing_type = ${ListingType.SALE}
      )::int AS sales,
      COUNT(DISTINCT sl.community_id) FILTER (
        WHERE sl.status = ${ListingStatus.ACTIVE}
      )::int AS communities,
      COUNT(*) FILTER (
        WHERE sl.created_at >= mb.curr_start AND sl.created_at <= mb.curr_end
      )::int AS current_month_listings,
      COUNT(*) FILTER (
        WHERE sl.created_at >= mb.prev_start AND sl.created_at <= mb.prev_end
      )::int AS previous_month_listings,
      COUNT(*) FILTER (
        WHERE sl.created_at >= mb.curr_start
          AND sl.created_at <= mb.curr_end
          AND sl.listing_type = ${ListingType.RENT}
      )::int AS current_month_rentals,
      COUNT(*) FILTER (
        WHERE sl.created_at >= mb.prev_start
          AND sl.created_at <= mb.prev_end
          AND sl.listing_type = ${ListingType.RENT}
      )::int AS previous_month_rentals,
      COUNT(*) FILTER (
        WHERE sl.created_at >= mb.curr_start
          AND sl.created_at <= mb.curr_end
          AND sl.listing_type = ${ListingType.SALE}
      )::int AS current_month_sales,
      COUNT(*) FILTER (
        WHERE sl.created_at >= mb.prev_start
          AND sl.created_at <= mb.prev_end
          AND sl.listing_type = ${ListingType.SALE}
      )::int AS previous_month_sales,
      COUNT(DISTINCT sl.community_id) FILTER (
        WHERE sl.created_at >= mb.curr_start AND sl.created_at <= mb.curr_end
      )::int AS current_month_communities,
      COUNT(DISTINCT sl.community_id) FILTER (
        WHERE sl.created_at >= mb.prev_start AND sl.created_at <= mb.prev_end
      )::int AS previous_month_communities
    FROM scoped_listings sl
    CROSS JOIN month_bounds mb
  `);

  return mapDashboardMetricsRow(rows[0]);
}

export async function fetchDashboardMetrics(
  scope: DashboardQueryScope
): Promise<DashboardMetrics> {
  return rscTry("fetchDashboardMetrics", async () => {
    const scopeKey = scope.agentId ?? "global";
    return cacheDashboardMetrics(scopeKey, () => queryDashboardMetrics(scope));
  });
}
