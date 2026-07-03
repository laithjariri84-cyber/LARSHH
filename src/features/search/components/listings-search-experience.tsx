"use client";

import { useMemo, useState } from "react";

import { mockListingSearchData } from "../data/mock-listings-search";
import {
  defaultListingsSearchFilters,
  filterListings,
  type ListingsSearchFilters,
} from "../lib/filter-listings";
import { ListingsEnterpriseTable } from "./listings-enterprise-table";
import { ListingsSearchBar } from "./listings-search-bar";
import { ListingsSearchFiltersPanel } from "./listings-search-filters-panel";
import { PropertyDetailsDrawer } from "./property-details-drawer";
import type { ListingSearchRecord } from "../data/mock-listings-search";

export function ListingsSearchExperience() {
  const [filters, setFilters] = useState<ListingsSearchFilters>(
    defaultListingsSearchFilters
  );
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [selectedListing, setSelectedListing] =
    useState<ListingSearchRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredListings = useMemo(
    () => filterListings(mockListingSearchData, filters),
    [filters]
  );

  function handleSelectListing(listing: ListingSearchRecord) {
    setSelectedListing(listing);
    setDrawerOpen(true);
  }

  function handleResetFilters() {
    setFilters(defaultListingsSearchFilters);
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <p className="text-gold text-sm font-medium tracking-[0.2em] uppercase">
          LARSSH
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          Search Listings
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Enterprise-grade property discovery with pricing intelligence, ownership
          context, and CRM-style record review.
        </p>
      </div>

      <ListingsSearchBar
        value={filters.query}
        onChange={(query) => setFilters((prev) => ({ ...prev, query }))}
        resultCount={filteredListings.length}
        filtersVisible={filtersVisible}
        onToggleFilters={() => setFiltersVisible((prev) => !prev)}
      />

      {filtersVisible ? (
        <ListingsSearchFiltersPanel
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
        />
      ) : null}

      <ListingsEnterpriseTable
        listings={filteredListings}
        onSelect={handleSelectListing}
        selectedId={selectedListing?.id}
      />

      <PropertyDetailsDrawer
        listing={selectedListing}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
