import type { Metadata } from "next";
import Link from "next/link";

import { Database, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isMarketIntelligenceAdmin } from "@/lib/market-intelligence-admin-auth";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const showMiAdmin = await isMarketIntelligenceAdmin();

  return (
    <div className="larssh-page space-y-6">
      <div>
        <p className="text-gold flex items-center gap-2 text-sm font-medium tracking-wide uppercase">
          <Settings className="size-4" />
          Settings
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          Workspace Settings
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Configure platform data, preferences, and administrative tools.
        </p>
      </div>

      {showMiAdmin ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <section className="larssh-card larssh-card-hover rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-gold/20 bg-gold/10 p-3">
                <Database className="text-gold size-5" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">Market Intelligence CMS</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Manage community intelligence profiles, benchmarks, and advisory
                  notes used across LARSSH.
                </p>
                <Button className="larssh-gold-btn mt-4" asChild>
                  <Link href="/admin/market-intelligence">Open CMS</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
