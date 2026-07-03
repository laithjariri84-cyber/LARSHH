"use client";

import { FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notifications";

import { SectionCard } from "./section-card";

const DOCUMENT_TYPES = [
  { id: "title-deed", label: "Title Deed", description: "Property ownership document" },
  { id: "passport", label: "Passport", description: "Owner identification copy" },
  { id: "form-a", label: "Form A", description: "DLD sale form" },
  { id: "noc", label: "NOC", description: "No objection certificate" },
  { id: "tenancy", label: "Tenancy Contract", description: "Current or draft lease" },
] as const;

export function PropertyDocuments() {
  return (
    <SectionCard
      title="Documents"
      description="Secure document vault for this listing"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {DOCUMENT_TYPES.map((doc) => (
          <div
            key={doc.id}
            className="larssh-card-hover flex items-start justify-between gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 transition-all hover:border-gold/20"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="bg-gold/10 text-gold flex size-10 shrink-0 items-center justify-center rounded-xl">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{doc.label}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {doc.description}
                </p>
                <p className="text-muted-foreground mt-2 text-[11px]">
                  No file uploaded
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-white/10 hover:border-gold/30 hover:text-gold"
              onClick={() =>
                notify.info(
                  "Upload coming soon",
                  `${doc.label} upload will be enabled in a future release.`
                )
              }
            >
              <Upload className="size-4" />
              Upload
            </Button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
