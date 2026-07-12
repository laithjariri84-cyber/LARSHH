import { ListingStatus, ListingType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { cacheDashboardMetrics } from "@/lib/server-cache";

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

const EMPTY_METRICS: DashboardMetrics = {
  activeListings: 0,
  rentals: 0,
  sales: 0,
  communities: 0,
  currentMonthListings: 0,
  previousMonthListings: 0,
  currentMonthRentals: 0,
  previousMonthRentals: 0,
  currentMonthSales: 0,
  previousMonthSales: 0,
  currentMonthCommunities: 0,
  previousMonthCommunities: 0,
};

function monthBounds(monthsAgo: number): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() - monthsAgo + 1,
    0,
    23,
    59,
    59,
    999
  );
  return { start, end };
}

function listingWhere(scope: DashboardQueryScope) {
  if (scope.noListings) {
    return { id: "00000000-0000-0000-0000-000000000000" };
  }

  const base = {
    deletedAt: null,
    property: { deletedAt: null },
  } as const;

  if (scope.agentId) {
    return { ...base, agentId: scope.agentId };
  }

  return base;
}

/** Single query — avoids exhausting Supabase pooler connections. */
export async function queryDashboardMetrics(
  scope: DashboardQueryScope
): Promise<DashboardMetrics> {
  if (scope.noListings) {
    return EMPTY_METRICS;
  }

  const where = listingWhere(scope);
  const currentMonth = monthBounds(0);
  const previousMonth = monthBounds(1);

  const rows = await prisma.listing.findMany({
    where,
    select: {
      propertyId: true,
      listingType: true,
      status: true,
      createdAt: true,
      property: { select: { communityId: true } },
    },
  });

  const activePropertyIds = new Set<string>();
  const rentPropertyIds = new Set<string>();
  const salePropertyIds = new Set<string>();
  const activeCommunityIds = new Set<string>();
  const currentMonthCommunityIds = new Set<string>();
  const previousMonthCommunityIds = new Set<string>();

  let currentMonthListings = 0;
  let previousMonthListings = 0;
  let currentMonthRentals = 0;
  let previousMonthRentals = 0;
  let currentMonthSales = 0;
  let previousMonthSales = 0;

  for (const row of rows) {
    const communityId = row.property.communityId;
    const isActive = row.status === ListingStatus.ACTIVE;
    const inCurrentMonth =
      row.createdAt >= currentMonth.start && row.createdAt <= currentMonth.end;
    const inPreviousMonth =
      row.createdAt >= previousMonth.start && row.createdAt <= previousMonth.end;

    if (isActive) {
      activePropertyIds.add(row.propertyId);
      if (communityId) activeCommunityIds.add(communityId);
      if (row.listingType === ListingType.RENT) {
        rentPropertyIds.add(row.propertyId);
      }
      if (row.listingType === ListingType.SALE) {
        salePropertyIds.add(row.propertyId);
      }
    }

    if (inCurrentMonth) {
      currentMonthListings += 1;
      if (communityId) currentMonthCommunityIds.add(communityId);
      if (row.listingType === ListingType.RENT) currentMonthRentals += 1;
      if (row.listingType === ListingType.SALE) currentMonthSales += 1;
    }

    if (inPreviousMonth) {
      previousMonthListings += 1;
      if (communityId) previousMonthCommunityIds.add(communityId);
      if (row.listingType === ListingType.RENT) previousMonthRentals += 1;
      if (row.listingType === ListingType.SALE) previousMonthSales += 1;
    }
  }

  return {
    activeListings: activePropertyIds.size,
    rentals: rentPropertyIds.size,
    sales: salePropertyIds.size,
    communities: activeCommunityIds.size,
    currentMonthListings,
    previousMonthListings,
    currentMonthRentals,
    previousMonthRentals,
    currentMonthSales,
    previousMonthSales,
    currentMonthCommunities: currentMonthCommunityIds.size,
    previousMonthCommunities: previousMonthCommunityIds.size,
  };
}

export async function fetchDashboardMetrics(
  scope: DashboardQueryScope
): Promise<DashboardMetrics> {
  const scopeKey = scope.noListings
    ? "founder"
    : (scope.agentId ?? "global");
  return cacheDashboardMetrics(scopeKey, () => queryDashboardMetrics(scope));
}
