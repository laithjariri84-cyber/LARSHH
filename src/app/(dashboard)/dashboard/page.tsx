import type { Metadata } from "next";

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
import { getShellUser } from "@/lib/auth";
import {
  getDashboardPageContent,
  getDashboardStatistics,
} from "@/server/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

/** Agent-scoped stats require auth + live DB — skip build-time prerender. */
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const shellUser = await getShellUser();
  const stats = await getDashboardStatistics();
  const content = await getDashboardPageContent();

  return (
    <div className="larssh-page">
      <WelcomeHeader name={shellUser.name} />

      <StatCards stats={stats} />

      <MarketOverview cards={content.marketOverview} />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ListingTrendChart
            data={content.listingTrend}
            title="Listing Volume Trend"
            subtitle="Active listings over the last 6 months"
          />
        </div>
        <MarketMixChart data={content.marketMix} title="Rent vs Sale Mix" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentListingsTable listings={content.recentListings} />
        </div>
        <RecentlyUpdated items={content.recentlyUpdated} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PriceIndexChart
          data={content.priceIndex}
          title="Price Index Movement"
        />
        <QuickActions actions={content.quickActions} />
      </div>
    </div>
  );
}
