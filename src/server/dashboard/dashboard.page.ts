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
import { getDashboardQueryScope } from "./dashboard.scope";

export type DashboardPageContent = {
  recentListings: DashboardListingRow[];
  recentlyUpdated: DashboardUpdatedListing[];
  marketOverview: DashboardMarketOverviewCard[];
  listingTrend: DashboardChartPoint[];
  marketMix: DashboardChartPoint[];
  priceIndex: DashboardChartPoint[];
  quickActions: typeof quickActions;
};

const EMPTY_PAGE_CONTENT: DashboardPageContent = {
  recentListings: [],
  recentlyUpdated: [],
  marketOverview: [],
  listingTrend: [],
  marketMix: [],
  priceIndex: [],
  quickActions,
};

export async function getDashboardPageContent(): Promise<DashboardPageContent> {
  if (isUiOnlyMode()) {
    const {
      listingTrendData,
      marketMixData,
      marketOverview,
      priceIndexData,
      recentListings,
      recentlyUpdated,
    } = await import("@/features/dashboard/data/mock-dashboard");

    return {
      recentListings,
      recentlyUpdated,
      marketOverview,
      listingTrend: listingTrendData,
      marketMix: marketMixData,
      priceIndex: priceIndexData,
      quickActions,
    };
  }

  try {
    const scope = await getDashboardQueryScope();
    const recentListingsRows = await getDashboardRecentListings(scope);
    const recentlyUpdatedRows = await getDashboardRecentlyUpdated(scope);
    const marketOverviewCards = await getDashboardMarketOverview();
    const listingTrend = await getDashboardListingTrend(scope);
    const marketMix = await getDashboardMarketMix(scope);
    const priceIndex = await getDashboardPriceIndex(scope);

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
    return EMPTY_PAGE_CONTENT;
  }
}
