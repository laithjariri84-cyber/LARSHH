import type { Metadata } from "next";

import { ForbiddenPanel } from "@/components/auth/forbidden-panel";
import { ImportWorkflow } from "@/features/import/components/import-workflow";
import { hasPermission } from "@/lib/auth/permissions";
import { getAuthContext } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Import Listings" };

export default async function ImportPage() {
  const context = await getAuthContext();
  if (!context || !hasPermission(context.appRole, "access.import")) {
    return (
      <ForbiddenPanel message="Listing import is restricted to Founder and Admin roles." />
    );
  }

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
