import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ComparableListing, IntelligencePurpose } from "../types";
import {
  formatCurrency,
  formatPercent,
} from "../lib/generate-intelligence-report";
import { TerminalSection } from "./terminal-metric";
import { cn } from "@/lib/utils";

type IntelligenceComparablesTableProps = {
  listings: ComparableListing[];
  purpose: IntelligencePurpose;
};

export function IntelligenceComparablesTable({
  listings,
  purpose,
}: IntelligenceComparablesTableProps) {
  return (
    <TerminalSection title="Comparable Listings">
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/20">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead>Building</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Price/sqft</TableHead>
                <TableHead className="text-right">Difference %</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id} className="border-white/5">
                  <TableCell className="font-medium">{listing.building}</TableCell>
                  <TableCell className="text-muted-foreground text-right font-mono text-sm">
                    {listing.size.toLocaleString()} sqft
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatCurrency(listing.price, purpose)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${listing.pricePerSqft.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono font-medium",
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
      </div>
    </TerminalSection>
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
