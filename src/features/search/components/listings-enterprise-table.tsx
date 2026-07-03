"use client";

import { Building2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ListingSearchRecord } from "../data/mock-listings-search";
import {
  formatDifference,
  formatListingPrice,
  PricePositionBadge,
} from "./price-position-badge";
import { cn } from "@/lib/utils";

type ListingsEnterpriseTableProps = {
  listings: ListingSearchRecord[];
  onSelect: (listing: ListingSearchRecord) => void;
  selectedId?: string | null;
};

export function ListingsEnterpriseTable({
  listings,
  onSelect,
  selectedId,
}: ListingsEnterpriseTableProps) {
  if (listings.length === 0) {
    return (
      <div className="paragon-card flex flex-col items-center justify-center rounded-2xl px-6 py-20 text-center">
        <Building2 className="text-muted-foreground mb-4 size-10" />
        <h3 className="text-lg font-semibold">No listings match your filters</h3>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Adjust your search criteria or reset filters to explore the full portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="paragon-card overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[72px]">Image</TableHead>
              <TableHead>Property Code</TableHead>
              <TableHead>Community</TableHead>
              <TableHead>Property Type</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="text-center">Beds</TableHead>
              <TableHead className="text-center">Baths</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Market Price</TableHead>
              <TableHead className="text-right">Difference</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow
                key={listing.id}
                onClick={() => onSelect(listing)}
                className={cn(
                  "cursor-pointer border-white/5 transition-colors",
                  "hover:bg-gold/[0.04]",
                  selectedId === listing.id && "bg-gold/[0.06]"
                )}
              >
                <TableCell>
                  <div
                    className={cn(
                      "flex size-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner",
                      listing.imageGradient
                    )}
                  >
                    <Building2 className="size-4 text-white/70" />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{listing.propertyCode}</p>
                    <PricePositionBadge
                      position={listing.pricePosition}
                      className="mt-1"
                    />
                  </div>
                </TableCell>
                <TableCell>{listing.community}</TableCell>
                <TableCell className="text-muted-foreground">
                  {listing.propertyType}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-white/10 text-[10px]",
                      listing.purpose === "Rent"
                        ? "text-sky-400"
                        : "text-gold"
                    )}
                  >
                    {listing.purpose}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatListingPrice(listing.price, listing.purpose)}
                </TableCell>
                <TableCell className="text-muted-foreground text-right">
                  {listing.size.toLocaleString()} sqft
                </TableCell>
                <TableCell className="text-center">
                  {listing.bedrooms === 0 ? "Studio" : listing.bedrooms}
                </TableCell>
                <TableCell className="text-center">{listing.bathrooms}</TableCell>
                <TableCell className="max-w-[120px] truncate">
                  {listing.agent}
                </TableCell>
                <TableCell className="max-w-[140px] truncate text-muted-foreground">
                  {listing.owner}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatListingPrice(listing.marketPrice, listing.purpose)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium",
                    listing.difference < 0 && "text-emerald-400",
                    listing.difference > 0 && "text-red-400",
                    listing.difference === 0 && "text-sky-400"
                  )}
                >
                  {formatDifference(listing.difference)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={listing.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ListingSearchRecord["status"] }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-white/10 text-[10px]",
        status === "Active" && "border-emerald-500/30 text-emerald-400",
        status === "Pending" && "border-amber-500/30 text-amber-400",
        status === "Under Offer" && "border-sky-500/30 text-sky-400",
        status === "Draft" && "text-muted-foreground",
        status === "Withdrawn" && "border-red-500/30 text-red-400"
      )}
    >
      {status}
    </Badge>
  );
}
