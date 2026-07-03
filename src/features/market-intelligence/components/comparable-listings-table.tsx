import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ComparableListing } from "../types";
import {
  formatCurrency,
  formatPercent,
} from "../lib/generate-market-analytics";
import { cn } from "@/lib/utils";

type ComparableListingsTableProps = {
  listings: ComparableListing[];
};

export function ComparableListingsTable({
  listings,
}: ComparableListingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead>Property</TableHead>
            <TableHead>Building</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Size</TableHead>
            <TableHead className="text-right">Price/sqft</TableHead>
            <TableHead className="text-right">Difference %</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.id} className="border-white/5">
              <TableCell className="font-medium">{listing.property}</TableCell>
              <TableCell className="text-muted-foreground max-w-[180px] truncate">
                {listing.building}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(listing.price)}
              </TableCell>
              <TableCell className="text-muted-foreground text-right">
                {listing.size.toLocaleString()} sqft
              </TableCell>
              <TableCell className="text-right">
                ${listing.pricePerSqft.toLocaleString()}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium",
                  listing.differencePercent < 0 && "text-emerald-400",
                  listing.differencePercent > 0 && "text-red-400",
                  listing.differencePercent === 0 && "text-sky-400"
                )}
              >
                {formatPercent(listing.differencePercent)}
              </TableCell>
              <TableCell>
                <StatusBadge status={listing.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: ComparableListing["status"] }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-white/10 text-[10px]",
        status === "Active" && "border-emerald-500/30 text-emerald-400",
        status === "Under Offer" && "border-sky-500/30 text-sky-400",
        status === "Pending" && "border-amber-500/30 text-amber-400",
        status === "Sold" && "text-muted-foreground"
      )}
    >
      {status}
    </Badge>
  );
}
