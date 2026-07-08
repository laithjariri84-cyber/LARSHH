import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ListingRow } from "../data/mock-dashboard";
import { cn } from "@/lib/utils";

type RecentListingsTableProps = {
  listings: ListingRow[];
};

export function RecentListingsTable({ listings }: RecentListingsTableProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight max-md:text-base">
          Recent Listings
        </h2>
        <Link
          href="/search"
          className="text-gold min-h-11 text-sm font-medium transition-opacity hover:opacity-80 max-lg:px-2 lg:min-h-0"
        >
          View all
        </Link>
      </div>

      <div className="grid gap-3 lg:hidden">
        {listings.map((row) => (
          <Link
            key={row.id}
            href={`/properties/${row.id}`}
            className="paragon-card rounded-xl p-4 transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{row.community}</p>
                <p className="text-muted-foreground truncate text-sm">
                  {row.building} · Unit {row.unit}
                </p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <Badge
                variant="outline"
                className={cn(
                  "border-white/10 text-xs",
                  row.type === "Rent" ? "text-sky-400" : "text-gold"
                )}
              >
                {row.type}
              </Badge>
              <span className="font-medium">{row.price}</span>
              <span className="text-muted-foreground">{row.beds} beds</span>
              <span className="text-muted-foreground truncate">{row.agent}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="paragon-card hidden overflow-hidden rounded-2xl lg:block">
        <div className="larssh-table-scroll">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead>Community</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Beds</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-white/5 transition-colors hover:bg-white/[0.02]"
                >
                  <TableCell className="font-medium">
                    <Link
                      href={`/properties/${row.id}`}
                      className="hover:text-gold transition-colors"
                    >
                      {row.community}
                    </Link>
                  </TableCell>
                  <TableCell>{row.building}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-white/10 text-xs",
                        row.type === "Rent"
                          ? "text-sky-400"
                          : "text-gold"
                      )}
                    >
                      {row.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {row.price}
                  </TableCell>
                  <TableCell className="text-center">{row.beds}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.agent}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: ListingRow["status"] }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-white/10 text-xs",
        status === "Active" && "border-emerald-500/30 text-emerald-400",
        status === "Pending" && "border-amber-500/30 text-amber-400",
        status === "Draft" && "text-muted-foreground"
      )}
    >
      {status}
    </Badge>
  );
}
