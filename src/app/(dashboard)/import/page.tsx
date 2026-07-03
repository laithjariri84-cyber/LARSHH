import type { Metadata } from "next";

import { ImportWorkflow } from "@/features/import/components/import-workflow";

export const metadata: Metadata = { title: "Import Listings" };

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import Listings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Upload a CSV, map columns to database fields, preview validation, then
          import into PostgreSQL. Imported properties appear immediately in Search.
        </p>
      </div>
      <ImportWorkflow />
    </div>
  );
}
