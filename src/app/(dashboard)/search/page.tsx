import type { Metadata } from "next";
import { Suspense } from "react";

import { EmptyState } from "@/features/search/components/empty-state";
import { ListingsTable } from "@/features/search/components/listings-table";
import { SearchLoadingSkeleton } from "@/features/search/components/loading-skeleton";
import { SearchFilters } from "@/features/search/components/search-filters";
import { loadSearchPageData } from "@/features/search/services/search-properties";
import { enrichSearchResultsWithMarketIntelligence } from "@/features/search/services/enrich-search-intelligence";
import { parseSearchFilters } from "@/features/search/schemas/search-filters.schema";
import {
  parseDetectedKeys,
  parseSmartSearchMeta,
} from "@/features/search/schemas/smart-search.schema";
import { applySmartSearchResults } from "@/features/search/smart-search/apply-smart-search-sort";
import { SmartSearchBar } from "@/features/search/smart-search/smart-search-bar";
import { logRscError, rscTry, rscTrySync } from "@/lib/rsc-debug";

export const metadata: Metadata = { title: "Search Listings" };
export const dynamic = "force-dynamic";

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
  return rscTrySync("search/page:parseSearchParams", () => {
    const raw = {
      communityId: pickParam(params, "communityId"),
      buildingId: pickParam(params, "buildingId"),
      propertyType: pickParam(params, "propertyType"),
      listingType: pickParam(params, "listingType"),
      bedrooms: pickParam(params, "bedrooms"),
      bathrooms: pickParam(params, "bathrooms"),
      furnishing: pickParam(params, "furnishing"),
      view: pickParam(params, "view"),
      status: pickParam(params, "status"),
      minPrice: pickParam(params, "minPrice"),
      maxPrice: pickParam(params, "maxPrice"),
      minSize: pickParam(params, "minSize"),
      maxSize: pickParam(params, "maxSize"),
      minPricePerSqft: pickParam(params, "minPricePerSqft"),
      maxPricePerSqft: pickParam(params, "maxPricePerSqft"),
      minRoi: pickParam(params, "minRoi"),
    };

    const smartMeta = parseSmartSearchMeta(params);

    return {
      filters: parseSearchFilters(raw),
      smartMeta,
      detectedKeys: parseDetectedKeys(smartMeta.detected),
      hasFilters:
        Object.values(raw).some(Boolean) ||
        Boolean(smartMeta.sort) ||
        Boolean(smartMeta.smartQuery),
    };
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  try {
    const params = await searchParams;
    const { filters, smartMeta, detectedKeys, hasFilters } =
      parseSearchParams(params);

    const { results: rawResults, communities, buildings } = await rscTry(
      "search/page:loadSearchPageData",
      () => loadSearchPageData(filters)
    );

    const enrichedResults = await rscTry(
      "search/page:enrichSearchResultsWithMarketIntelligence",
      () => enrichSearchResultsWithMarketIntelligence(rawResults)
    );

    const results = rscTrySync("search/page:applySmartSearchResults", () =>
      applySmartSearchResults(enrichedResults, {
        sort: smartMeta.sort,
        filters,
        smartQuery: smartMeta.smartQuery,
      })
    );

    return (
      <div className="larssh-page space-y-6">
        <div>
          <p className="text-gold text-sm font-medium tracking-wide uppercase">
            Search Listings
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Property Search
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {results.length} properties found
            {smartMeta.smartQuery ? (
              <span> · Smart search active</span>
            ) : null}
          </p>
        </div>

        <Suspense fallback={<SearchLoadingSkeleton />}>
          <SmartSearchBar
            communities={communities}
            buildings={buildings}
            currentQuery={smartMeta.smartQuery ?? ""}
            currentDetected={detectedKeys}
          />
        </Suspense>

        <Suspense fallback={<SearchLoadingSkeleton />}>
          <SearchFilters
            values={filters}
            communities={communities}
            buildings={buildings}
            highlightedFields={detectedKeys}
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
    logRscError("search/page:render", error);
  }
}
