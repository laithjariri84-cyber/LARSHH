import type { Metadata } from "next";
import Link from "next/link";

import { ArrowLeft, Database } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MarketIntelligenceAdminPanel } from "@/features/market-intelligence-admin/components/market-intelligence-admin-panel";

export const metadata: Metadata = {
  title: "Market Intelligence Admin",
};

export default function MarketIntelligenceAdminPage() {
  return (
    <div className="larssh-page space-y-6">
      <Button variant="ghost" size="sm" className="larssh-press w-fit" asChild>
        <Link href="/settings">
          <ArrowLeft className="size-4" />
          Back to settings
        </Link>
      </Button>

      <div>
        <p className="text-gold flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
          <Database className="size-4" />
          Market Intelligence Admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          Community Research Database
        </h1>
        <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
          Manage rental, sales, and investment benchmarks for LARSSH communities.
          All property details pages read from this database. Values are stored in AED.
        </p>
      </div>

      <MarketIntelligenceAdminPanel />
    </div>
  );
}
