import {
  listingTrendData,
  marketMixData,
  marketOverview,
  priceIndexData,
  recentListings,
  recentlyUpdated,
} from "@/features/dashboard/data/mock-dashboard";
import { quickActions } from "@/features/dashboard/data/dashboard-actions";
import { isUiOnlyMode } from "@/lib/ui-only";

import {
  getDashboardListingTrend,
  getDashboardMarketMix,
  getDashboardMarketOverview,
  getDashboardPriceIndex,
  getDashboardRecentListings,
  getDashboardRecentlyUpdated,
  type DashboardChartPoint,
  type DashboardListingRow,
  type DashboardMarketOverviewCard,
  type DashboardUpdatedListing,
} from "./dashboard.content";

export type DashboardPageContent = {
  recentListings: DashboardListingRow[];
  recentlyUpdated: DashboardUpdatedListing[];
  marketOverview: DashboardMarketOverviewCard[];
  listingTrend: DashboardChartPoint[];
  marketMix: DashboardChartPoint[];
  priceIndex: DashboardChartPoint[];
  quickActions: typeof quickActions;
};

const MOCK_PAGE_CONTENT: DashboardPageContent = {
  recentListings,
  recentlyUpdated,
  marketOverview,
  listingTrend: listingTrendData,
  marketMix: marketMixData,
  priceIndex: priceIndexData,
  quickActions,
};

export async function getDashboardPageContent(): Promise<DashboardPageContent> {
  if (isUiOnlyMode()) {
    return MOCK_PAGE_CONTENT;
  }

  try {
    const [
      recentListingsRows,
      recentlyUpdatedRows,
      marketOverviewCards,
      listingTrend,
      marketMix,
      priceIndex,
    ] = await Promise.all([
      getDashboardRecentListings(),
      getDashboardRecentlyUpdated(),
      getDashboardMarketOverview(),
      getDashboardListingTrend(),
      getDashboardMarketMix(),
      getDashboardPriceIndex(),
    ]);

    return {
      recentListings: recentListingsRows,
      recentlyUpdated: recentlyUpdatedRows,
      marketOverview: marketOverviewCards,
      listingTrend,
      marketMix,
      priceIndex,
      quickActions,
    };
  } catch (error) {
    console.error("[dashboard] getDashboardPageContent:", error);
    return MOCK_PAGE_CONTENT;
  }
}
