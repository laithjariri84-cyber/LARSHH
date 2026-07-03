"use client";

import { FileText, Printer } from "lucide-react";

import type { MarketAnalytics, MarketFilters } from "../types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PricingReportDocument,
  PricingReportScreenPreview,
} from "./pricing-report-document";

type PricingReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: MarketFilters;
  analytics: MarketAnalytics;
};

export function PricingReportDialog({
  open,
  onOpenChange,
  filters,
  analytics,
}: PricingReportDialogProps) {
  const generatedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <div className="pricing-report-print-source pointer-events-none fixed top-0 left-[-9999px] w-[210mm] opacity-0">
        <PricingReportDocument
          filters={filters}
          analytics={analytics}
          generatedAt={generatedAt}
        />
      </div>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-hidden sm:max-w-5xl">
          <DialogHeader className="border-b border-white/5 px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4 pr-8">
              <div>
                <DialogTitle>Pricing Report Preview</DialogTitle>
                <DialogDescription className="mt-1">
                  Review the report, then print or save as PDF from your browser.
                </DialogDescription>
              </div>
              <Button onClick={handlePrint} className="paragon-gold-gradient text-gold-foreground">
                <Printer className="size-4" />
                Print / Save PDF
              </Button>
            </div>
          </DialogHeader>

          <div className="px-6 pb-6">
            <PricingReportScreenPreview
              filters={filters}
              analytics={analytics}
              generatedAt={generatedAt}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GeneratePricingReportButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className="paragon-gold-gradient text-gold-foreground h-11 rounded-xl px-5 shadow-lg shadow-gold/10"
    >
      <FileText className="size-4" />
      Generate Pricing Report
    </Button>
  );
}
