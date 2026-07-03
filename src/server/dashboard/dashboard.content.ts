import { ListingStatus, ListingType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { formatCurrency, formatLabel } from "@/lib/utils";
import { listCommunityMarketSummaries } from "@/server/market-intelligence/market-intelligence.aggregate";

export type DashboardChartPoint = {
  label: string;
  value: number;
};

export type DashboardMarketOverviewCard = {
  title: string;
  value: string;
  subtitle: string;
  trend?: string;
};

export type DashboardListingRow = {
  id: string;
  community: string;
  building: string;
  unit: string;
  type: "Rent" | "Sale";
  price: string;
  beds: number;
  sqft: number;
  agent: string;
  status: "Active" | "Pending" | "Draft";
};

export type DashboardUpdatedListing = {
  id: string;
  title: string;
  change: string;
  updatedAt: string;
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

export async function getDashboardListingTrend(): Promise<DashboardChartPoint[]> {
  const points: DashboardChartPoint[] = [];

  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo -= 1) {
    const { start, end } = monthBounds(monthsAgo);
    const count = await prisma.listing.count({
      where: {
        deletedAt: null,
        createdAt: { gte: start, lte: end },
      },
    });

    points.push({
      label: start.toLocaleDateString("en-US", { month: "short" }),
      value: count,
    });
  }

  return points;
}

export async function getDashboardMarketMix(): Promise<DashboardChartPoint[]> {
  const [rentals, sales] = await Promise.all([
    prisma.listing.count({
      where: {
        deletedAt: null,
        listingType: ListingType.RENT,
        status: ListingStatus.ACTIVE,
      },
    }),
    prisma.listing.count({
      where: {
        deletedAt: null,
        listingType: ListingType.SALE,
        status: ListingStatus.ACTIVE,
      },
    }),
  ]);

  return [
    { label: "Rentals", value: rentals },
    { label: "Sales", value: sales },
  ];
}

export async function getDashboardMarketOverview(): Promise<
  DashboardMarketOverviewCard[]
> {
  const summaries = await listCommunityMarketSummaries();
  const available = summaries.filter((summary) => summary.available);

  if (available.length === 0) {
    return [
      {
        title: "Average Sale Price",
        value: "Market data not available",
        subtitle: "Across seeded communities",
      },
      {
        title: "Average Rent",
        value: "Market data not available",
        subtitle: "Annual rent benchmark",
      },
      {
        title: "Average ROI",
        value: "Market data not available",
        subtitle: "Estimated gross yield",
      },
      {
        title: "Average Confidence",
        value: "Market data not available",
        subtitle: "Research conviction score",
      },
    ];
  }

  const avg = (values: Array<number | null>) => {
    const filtered = values.filter((value): value is number => value !== null);
    if (!filtered.length) return null;
    return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
  };

  const averageSale = avg(available.map((item) => item.averageSalePrice));
  const averageRent = avg(available.map((item) => item.averageRent));
  const averageRoi = avg(available.map((item) => item.roi));
  const averageConfidence = avg(available.map((item) => item.confidence));

  return [
    {
      title: "Average Sale Price",
      value:
        averageSale !== null
          ? formatCurrency(averageSale, "AED")
          : "Market data not available",
      subtitle: "Across market intelligence communities",
    },
    {
      title: "Average Rent",
      value:
        averageRent !== null
          ? `${formatCurrency(averageRent, "AED")}/yr`
          : "Market data not available",
      subtitle: "Unfurnished annual rent benchmark",
    },
    {
      title: "Average ROI",
      value:
        averageRoi !== null
          ? `${Math.round(averageRoi * 10) / 10}%`
          : "Market data not available",
      subtitle: "Estimated gross rental yield",
    },
    {
      title: "Average Confidence",
      value:
        averageConfidence !== null
          ? `${Math.round(averageConfidence)}%`
          : "Market data not available",
      subtitle: "Research conviction score",
    },
  ];
}

export async function getDashboardRecentListings(): Promise<DashboardListingRow[]> {
  const properties = await prisma.property.findMany({
    where: { deletedAt: null },
    include: {
      community: true,
      building: true,
      listings: {
        where: { deletedAt: null },
        include: { agent: { include: { user: true } } },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return properties
    .filter((property) => property.listings[0])
    .map((property) => {
      const listing = property.listings[0]!;
      const agentName = listing.agent.user?.fullName ?? "Unassigned";

      return {
        id: property.id,
        community: property.community.name,
        building: property.building.name,
        unit: property.unitNumber ?? "—",
        type: listing.listingType === ListingType.RENT ? "Rent" : "Sale",
        price:
          listing.listingType === ListingType.RENT
            ? `${formatCurrency(Number(listing.askingPrice), "AED")}/yr`
            : formatCurrency(Number(listing.askingPrice), "AED"),
        beds: property.bedrooms ?? 0,
        sqft: property.areaSqft ? Number(property.areaSqft) : 0,
        agent: agentName,
        status:
          listing.status === ListingStatus.ACTIVE
            ? "Active"
            : listing.status === ListingStatus.PENDING
              ? "Pending"
              : "Draft",
      };
    });
}

export async function getDashboardRecentlyUpdated(): Promise<
  DashboardUpdatedListing[]
> {
  const listings = await prisma.listing.findMany({
    where: { deletedAt: null },
    include: {
      property: {
        include: {
          building: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return listings.map((listing) => ({
    id: listing.id,
    title: `${listing.property.building.name}${
      listing.property.unitNumber ? ` · Unit ${listing.property.unitNumber}` : ""
    }`,
    change: `${formatLabel(listing.listingType)} updated to ${formatCurrency(
      Number(listing.askingPrice),
      "AED"
    )}`,
    updatedAt: listing.updatedAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));
}

export async function getDashboardPriceIndex(): Promise<DashboardChartPoint[]> {
  const points: DashboardChartPoint[] = [];

  for (let monthsAgo = 4; monthsAgo >= 0; monthsAgo -= 1) {
    const { start, end } = monthBounds(monthsAgo);
    const aggregate = await prisma.listing.aggregate({
      where: {
        deletedAt: null,
        listingType: ListingType.SALE,
        createdAt: { gte: start, lte: end },
      },
      _avg: { askingPrice: true },
    });

    points.push({
      label: start.toLocaleDateString("en-US", { month: "short" }),
      value: aggregate._avg.askingPrice
        ? Number(aggregate._avg.askingPrice) / 1_000_000
        : 0,
    });
  }

  return points;
}
