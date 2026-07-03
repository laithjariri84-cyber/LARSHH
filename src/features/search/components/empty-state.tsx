import { Building2, SearchX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  hasFilters?: boolean;
};

export function EmptyState({ hasFilters = false }: EmptyStateProps) {
  return (
    <div className="bg-card flex flex-col items-center justify-center rounded-xl border px-6 py-16 text-center shadow-sm">
      <div className="bg-muted mb-4 flex size-14 items-center justify-center rounded-full">
        {hasFilters ? (
          <SearchX className="text-muted-foreground size-7" />
        ) : (
          <Building2 className="text-muted-foreground size-7" />
        )}
      </div>
      <h3 className="text-lg font-semibold tracking-tight">
        {hasFilters ? "No properties match your filters" : "No properties yet"}
      </h3>
      <p className="text-muted-foreground mt-2 max-w-md text-sm text-balance">
        {hasFilters
          ? "Try adjusting your search criteria or clearing filters to see more results."
          : "Import a PF Expert CSV to populate your property portfolio."}
      </p>
      {hasFilters ? (
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/search">Clear filters</Link>
        </Button>
      ) : (
        <Button className="mt-6" asChild>
          <Link href="/import">Import Listings</Link>
        </Button>
      )}
    </div>
  );
}
