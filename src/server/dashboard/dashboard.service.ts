import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUiOnlyMode } from "@/lib/ui-only";

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

async function resolveDashboardScope(): Promise<DashboardQueryScope> {
  if (isUiOnlyMode()) {
    return {};
  }

  const user = await getUser();
  if (!user) {
    return {};
  }

  const agent = await prisma.agent.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!agent) {
    return {};
  }

  return { agentId: agent.id };
}

export async function getDashboardStatistics(): Promise<DashboardStat[]> {
  const scope = await resolveDashboardScope();
  const metrics = await fetchDashboardMetrics(scope);

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
