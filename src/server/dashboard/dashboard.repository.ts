import { ListingStatus, ListingType, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

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

function listingScopeWhere(
  scope: DashboardQueryScope,
  extra: Prisma.ListingWhereInput = {}
): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = {
    deletedAt: null,
    ...extra,
  };

  if (scope.agentId) {
    where.agentId = scope.agentId;
  }

  return where;
}

function propertyWithListingWhere(
  scope: DashboardQueryScope,
  listingFilter: Prisma.ListingWhereInput
): Prisma.PropertyWhereInput {
  return {
    deletedAt: null,
    listings: {
      some: listingScopeWhere(scope, listingFilter),
    },
  };
}

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

function listingCreatedInMonthWhere(
  monthsAgo: number,
  scope: DashboardQueryScope,
  listingFilter: Prisma.ListingWhereInput = {}
): Prisma.ListingWhereInput {
  const { start, end } = monthBounds(monthsAgo);

  return listingScopeWhere(scope, {
    ...listingFilter,
    createdAt: {
      gte: start,
      lte: end,
    },
  });
}

function propertyWithListingCreatedInMonthWhere(
  monthsAgo: number,
  scope: DashboardQueryScope,
  listingFilter: Prisma.ListingWhereInput = {}
): Prisma.PropertyWhereInput {
  return {
    deletedAt: null,
    listings: {
      some: listingCreatedInMonthWhere(monthsAgo, scope, listingFilter),
    },
  };
}

export async function fetchDashboardMetrics(
  scope: DashboardQueryScope
): Promise<DashboardMetrics> {
  const activeListings = await prisma.property.count({
    where: propertyWithListingWhere(scope, { status: ListingStatus.ACTIVE }),
  });

  const rentals = await prisma.property.count({
    where: propertyWithListingWhere(scope, { listingType: ListingType.RENT }),
  });

  const sales = await prisma.property.count({
    where: propertyWithListingWhere(scope, { listingType: ListingType.SALE }),
  });

  const activeCommunityRows = await prisma.property.findMany({
    where: propertyWithListingWhere(scope, { status: ListingStatus.ACTIVE }),
    select: { communityId: true },
    distinct: ["communityId"],
  });

  const currentMonthListingsAgg = await prisma.listing.aggregate({
    where: listingCreatedInMonthWhere(0, scope),
    _count: { _all: true },
  });

  const previousMonthListingsAgg = await prisma.listing.aggregate({
    where: listingCreatedInMonthWhere(1, scope),
    _count: { _all: true },
  });

  const currentMonthRentalsAgg = await prisma.listing.aggregate({
    where: listingCreatedInMonthWhere(0, scope, {
      listingType: ListingType.RENT,
    }),
    _count: { _all: true },
  });

  const previousMonthRentalsAgg = await prisma.listing.aggregate({
    where: listingCreatedInMonthWhere(1, scope, {
      listingType: ListingType.RENT,
    }),
    _count: { _all: true },
  });

  const currentMonthSalesAgg = await prisma.listing.aggregate({
    where: listingCreatedInMonthWhere(0, scope, {
      listingType: ListingType.SALE,
    }),
    _count: { _all: true },
  });

  const previousMonthSalesAgg = await prisma.listing.aggregate({
    where: listingCreatedInMonthWhere(1, scope, {
      listingType: ListingType.SALE,
    }),
    _count: { _all: true },
  });

  const currentMonthCommunityRows = await prisma.property.findMany({
    where: propertyWithListingCreatedInMonthWhere(0, scope),
    select: { communityId: true },
    distinct: ["communityId"],
  });

  const previousMonthCommunityRows = await prisma.property.findMany({
    where: propertyWithListingCreatedInMonthWhere(1, scope),
    select: { communityId: true },
    distinct: ["communityId"],
  });

  return {
    activeListings,
    rentals,
    sales,
    communities: activeCommunityRows.length,
    currentMonthListings: currentMonthListingsAgg._count._all,
    previousMonthListings: previousMonthListingsAgg._count._all,
    currentMonthRentals: currentMonthRentalsAgg._count._all,
    previousMonthRentals: previousMonthRentalsAgg._count._all,
    currentMonthSales: currentMonthSalesAgg._count._all,
    previousMonthSales: previousMonthSalesAgg._count._all,
    currentMonthCommunities: currentMonthCommunityRows.length,
    previousMonthCommunities: previousMonthCommunityRows.length,
  };
}
