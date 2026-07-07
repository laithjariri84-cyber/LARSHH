import { ListingStatus, ListingType } from "@prisma/client";

import { searchProperties } from "@/lib/repositories/property.repository";
import { fetchDashboardMetrics } from "@/server/dashboard/dashboard.repository";

async function main() {
  const [metrics, activeProperties] = await Promise.all([
    fetchDashboardMetrics({}),
    searchProperties({ status: ListingStatus.ACTIVE }),
  ]);

  const allProperties = await searchProperties({});
  const rentalsFromSearch = allProperties.filter((property) =>
    property.listings.some((listing) => listing.listingType === ListingType.RENT)
  ).length;

  const salesFromSearch = allProperties.filter((property) =>
    property.listings.some((listing) => listing.listingType === ListingType.SALE)
  ).length;

  const communitiesFromSearch = new Set(
    activeProperties.map((property) => property.community.id)
  ).size;

  console.log("Dashboard statistics verification");
  console.log("--------------------------------");
  console.log(
    `Active Listings: dashboard=${metrics.activeListings}, search(status=ACTIVE)=${activeProperties.length}, match=${metrics.activeListings === activeProperties.length}`
  );
  console.log(
    `Rentals: dashboard=${metrics.rentals}, search-derived=${rentalsFromSearch}, match=${metrics.rentals === rentalsFromSearch}`
  );
  console.log(
    `Sales: dashboard=${metrics.sales}, search-derived=${salesFromSearch}, match=${metrics.sales === salesFromSearch}`
  );
  console.log(
    `Communities: dashboard=${metrics.communities}, search-derived(active)=${communitiesFromSearch}, match=${metrics.communities === communitiesFromSearch}`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$disconnect();
  });
