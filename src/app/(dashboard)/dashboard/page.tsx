import type { Metadata } from "next";

import {
  listingTrendData,
  marketMixData,
  marketOverview,
  mockUser,
  priceIndexData,
  quickActions,
  recentListings,
  recentlyUpdated,
} from "@/features/dashboard/data/mock-dashboard";
import {
  ListingTrendChart,
  MarketMixChart,
  PriceIndexChart,
} from "@/features/dashboard/components/dashboard-charts";
import { MarketOverview } from "@/features/dashboard/components/market-overview";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RecentListingsTable } from "@/features/dashboard/components/recent-listings-table";
import { RecentlyUpdated } from "@/features/dashboard/components/recently-updated";
import { StatCards } from "@/features/dashboard/components/stat-cards";
import { WelcomeHeader } from "@/features/dashboard/components/welcome-header";
import { getDashboardStatistics } from "@/server/dashboard";
import { logRscError, rscTry } from "@/lib/rsc-debug";
import { perfAsync } from "@/lib/perf/timer";

export const metadata: Metadata = {
  title: "Dashboard",
};

/** Agent-scoped stats require auth + live DB — skip build-time prerender. */
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  return perfAsync("Dashboard render", async () => {
    try {
      const stats = await rscTry("getDashboardStatistics", () =>
        getDashboardStatistics()
      );

      return (
      <div className="larssh-page">
        <WelcomeHeader name={mockUser.name} />

        <StatCards stats={stats} />

        <MarketOverview cards={marketOverview} />

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ListingTrendChart
              data={listingTrendData}
              title="Listing Volume Trend"
              subtitle="Active listings over the last 6 months"
            />
          </div>
          <MarketMixChart data={marketMixData} title="Rent vs Sale Mix" />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RecentListingsTable listings={recentListings} />
          </div>
          <RecentlyUpdated items={recentlyUpdated} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PriceIndexChart
            data={priceIndexData}
            title="Price Index Movement"
          />
          <QuickActions actions={quickActions} />
        </div>
      </div>
    );
    } catch (error) {
      logRscError("dashboard/page:render", error);
    }
  });
}
