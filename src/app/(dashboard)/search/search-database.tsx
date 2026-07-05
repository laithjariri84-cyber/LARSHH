import type { Metadata } from "next";
import { Suspense } from "react";

import { EmptyState } from "@/features/search/components/empty-state";
import { ListingsTable } from "@/features/search/components/listings-table";
import { SearchLoadingSkeleton } from "@/features/search/components/loading-skeleton";
import { SearchFilters } from "@/features/search/components/search-filters";
import { loadSearchPageData } from "@/features/search/services/search-properties";
import { parseSearchFilters } from "@/features/search/schemas/search-filters.schema";
import { logRscError, rscTry } from "@/lib/rsc-debug";

export const metadata: Metadata = {
  title: "Search Listings",
};

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseSearchParams(
  params: Record<string, string | string[] | undefined>
) {
  const raw = {
    communityId: pickParam(params, "communityId"),
    buildingId: pickParam(params, "buildingId"),
    propertyType: pickParam(params, "propertyType"),
    bedrooms: pickParam(params, "bedrooms"),
    bathrooms: pickParam(params, "bathrooms"),
    furnishing: pickParam(params, "furnishing"),
    view: pickParam(params, "view"),
    status: pickParam(params, "status"),
    minPrice: pickParam(params, "minPrice"),
    maxPrice: pickParam(params, "maxPrice"),
    minSize: pickParam(params, "minSize"),
    maxSize: pickParam(params, "maxSize"),
  };

  return {
    filters: parseSearchFilters(raw),
    hasFilters: Object.values(raw).some(Boolean),
  };
}

export default async function DatabaseSearchPage({
  searchParams,
}: SearchPageProps) {
  try {
    const params = await searchParams;
    const { filters, hasFilters } = parseSearchParams(params);

    const { results, communities, buildings } = await rscTry(
      "search/search-database:loadSearchPageData",
      () => loadSearchPageData(filters)
    );

    return (
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div>
          <p className="text-gold text-sm font-medium tracking-wide uppercase">
            Search Listings
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Property Search
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {results.length} properties found
          </p>
        </div>

        <Suspense fallback={<SearchLoadingSkeleton />}>
          <SearchFilters
            values={filters}
            communities={communities}
            buildings={buildings}
          />
        </Suspense>

        <section>
          {results.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : (
            <ListingsTable rows={results} />
          )}
        </section>
      </div>
    );
  } catch (error) {
    logRscError("search/search-database:render", error);
  }
}
