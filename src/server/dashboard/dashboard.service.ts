import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUiOnlyMode } from "@/lib/ui-only";
import { cache } from "react";

import { fetchDashboardMetrics } from "./dashboard.repository";
import type {
  DashboardQueryScope,
  DashboardStat,
  DashboardStatTrend,
} from "./dashboard.types";

function formatGrowthPercent(
  currentMonth: number,
  previousMonth: number
): { change: string; trend: DashboardStatTrend } {
  if (previousMonth <= 0) {
    return { change: "—", trend: "neutral" };
  }

  const percent = ((currentMonth - previousMonth) / previousMonth) * 100;
  const rounded = Math.round(percent * 10) / 10;

  if (rounded === 0) {
    return { change: "0%", trend: "neutral" };
  }

  const sign = rounded > 0 ? "+" : "";
  return {
    change: `${sign}${rounded}%`,
    trend: rounded > 0 ? "up" : "down",
  };
}

const resolveAgentId = cache(async (userId: string): Promise<string | null> => {
  const agent = await prisma.agent.findUnique({
    where: { userId },
    select: { id: true },
  });
  return agent?.id ?? null;
});

async function resolveDashboardScope(): Promise<DashboardQueryScope> {
  if (isUiOnlyMode()) {
    return {};
  }

  const user = await getUser();
  if (!user) {
    return {};
  }

  const agentId = await resolveAgentId(user.id);
  if (!agentId) {
    return {};
  }

  return { agentId };
}

const UI_ONLY_DASHBOARD_STATS: DashboardStat[] = [
  { label: "Active Listings", value: "248", change: "+12%", trend: "up" },
  { label: "Rentals", value: "156", change: "+8%", trend: "up" },
  { label: "Sales", value: "92", change: "+4%", trend: "up" },
  { label: "Communities", value: "24", change: "0%", trend: "neutral" },
];

const EMPTY_DASHBOARD_STATS: DashboardStat[] = [
  { label: "Active Listings", value: "0", change: "—", trend: "neutral" },
  { label: "Rentals", value: "0", change: "—", trend: "neutral" },
  { label: "Sales", value: "0", change: "—", trend: "neutral" },
  { label: "Communities", value: "0", change: "—", trend: "neutral" },
];

function buildDashboardStats(metrics: Awaited<ReturnType<typeof fetchDashboardMetrics>>): DashboardStat[] {
  const activeGrowth = formatGrowthPercent(
    metrics.currentMonthListings,
    metrics.previousMonthListings
  );
  const rentalGrowth = formatGrowthPercent(
    metrics.currentMonthRentals,
    metrics.previousMonthRentals
  );
  const salesGrowth = formatGrowthPercent(
    metrics.currentMonthSales,
    metrics.previousMonthSales
  );
  const communityGrowth = formatGrowthPercent(
    metrics.currentMonthCommunities,
    metrics.previousMonthCommunities
  );

  return [
    {
      label: "Active Listings",
      value: String(metrics.activeListings),
      change: activeGrowth.change,
      trend: activeGrowth.trend,
    },
    {
      label: "Rentals",
      value: String(metrics.rentals),
      change: rentalGrowth.change,
      trend: rentalGrowth.trend,
    },
    {
      label: "Sales",
      value: String(metrics.sales),
      change: salesGrowth.change,
      trend: salesGrowth.trend,
    },
    {
      label: "Communities",
      value: String(metrics.communities),
      change: communityGrowth.change,
      trend: communityGrowth.trend,
    },
  ];
}

export async function getDashboardStatistics(): Promise<DashboardStat[]> {
  if (isUiOnlyMode()) {
    return UI_ONLY_DASHBOARD_STATS;
  }

  try {
    const scope = await resolveDashboardScope();
    const metrics = await fetchDashboardMetrics(scope);
    return buildDashboardStats(metrics);
  } catch (error) {
    console.error("[dashboard] getDashboardStatistics:", error);
    return EMPTY_DASHBOARD_STATS;
  }
}
