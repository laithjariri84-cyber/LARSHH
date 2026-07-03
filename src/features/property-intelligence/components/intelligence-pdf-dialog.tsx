"use client";

import { useEffect, useState } from "react";
import { FileText, Printer } from "lucide-react";

import type { IntelligenceAnalytics, IntelligenceFilters } from "../types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IntelligencePdfDocument,
  IntelligencePdfPreview,
} from "./intelligence-pdf-document";

type IntelligencePdfDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: IntelligenceFilters;
  analytics: IntelligenceAnalytics;
};

export function IntelligencePdfDialog({
  open,
  onOpenChange,
  filters,
  analytics,
}: IntelligencePdfDialogProps) {
  const [generatedAt, setGeneratedAt] = useState("");

  useEffect(() => {
    if (!open) return;

    setGeneratedAt(
      new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date())
    );
  }, [open]);

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {open && generatedAt ? (
        <div className="pricing-report-print-source pointer-events-none fixed top-0 left-[-9999px] w-[210mm] opacity-0">
          <IntelligencePdfDocument
            filters={filters}
            analytics={analytics}
            generatedAt={generatedAt}
          />
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-hidden sm:max-w-5xl">
          <DialogHeader className="border-b border-white/5 px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4 pr-8">
              <div>
                <DialogTitle>Property Intelligence Report</DialogTitle>
                <DialogDescription className="mt-1">
                  Printable PDF preview · {analytics.scopeLabel}
                </DialogDescription>
              </div>
              <Button
                onClick={handlePrint}
                className="paragon-gold-gradient text-gold-foreground"
              >
                <Printer className="size-4" />
                Print / Save PDF
              </Button>
            </div>
          </DialogHeader>
          <div className="px-6 pb-6">
            {generatedAt ? (
              <IntelligencePdfPreview
                filters={filters}
                analytics={analytics}
                generatedAt={generatedAt}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GenerateIntelligenceReportButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="h-11 rounded-xl border-gold/25 bg-gold-muted/20 hover:bg-gold-muted/40"
    >
      <FileText className="size-4" />
      Generate PDF Report
    </Button>
  );
}
