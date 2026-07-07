"use client";

import { useRouter } from "next/navigation";
import { memo } from "react";
import { ListingStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PropertySearchResult } from "@/features/search/types";
import { formatCurrency, formatLabel, formatNumber } from "@/lib/utils";
import { PropertyCard } from "./property-card";

type ListingsTableProps = {
  rows: PropertySearchResult[];
};

const statusVariant: Record<
  ListingStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  ACTIVE: "default",
  PENDING: "secondary",
  SOLD: "secondary",
  RENTED: "secondary",
  WITHDRAWN: "outline",
  EXPIRED: "destructive",
};

export function ListingsTable({ rows }: ListingsTableProps) {
  return (
    <>
      {/* Card grid — mobile/tablet; desktop table unchanged at 2xl+ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:hidden">
        {rows.map((row, index) => (
          <PropertyCard key={row.propertyId} property={row} index={index} />
        ))}
      </div>

      {/* Desktop table — unchanged at 2xl+ */}
      <div className="hidden 2xl:block">
        <div className="larssh-card overflow-hidden rounded-2xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Code</TableHead>
                <TableHead>Community</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-center">Beds</TableHead>
                <TableHead className="text-center">Baths</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead>View</TableHead>
                <TableHead>Furnishing</TableHead>
                <TableHead className="text-right">Asking Rent</TableHead>
                <TableHead className="text-right">Asking Sale</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <ListingTableRow key={row.propertyId} row={row} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

function ListingTableRowComponent({ row }: { row: PropertySearchResult }) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={() => router.push(`/properties/${row.propertyId}`)}
    >
      <TableCell className="font-mono text-xs">{row.propertyCode}</TableCell>
      <TableCell className="font-medium">{row.community}</TableCell>
      <TableCell>{row.building}</TableCell>
      <TableCell>{row.unitNumber ?? "—"}</TableCell>
      <TableCell className="text-center">{row.bedrooms ?? "—"}</TableCell>
      <TableCell className="text-center">{row.bathrooms ?? "—"}</TableCell>
      <TableCell className="text-right">
        {row.size ? `${formatNumber(row.size)} sq ft` : "—"}
      </TableCell>
      <TableCell>{row.view ? formatLabel(row.view) : "—"}</TableCell>
      <TableCell>
        {row.furnishing ? formatLabel(row.furnishing) : "—"}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(row.askingRent, row.currency)}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(row.askingSale, row.currency)}
      </TableCell>
      <TableCell>{row.assignedAgent ?? "—"}</TableCell>
      <TableCell>
        {row.status ? (
          <Badge variant={statusVariant[row.status]}>
            {formatLabel(row.status)}
          </Badge>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-right text-xs">
        {row.lastUpdated.toLocaleDateString()}
      </TableCell>
    </TableRow>
  );
}

const ListingTableRow = memo(ListingTableRowComponent);
