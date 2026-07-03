import type { Metadata } from "next";
import Link from "next/link";

import { Database, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <section className="larssh-card larssh-card-hover rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-gold/20 bg-gold/10 p-3">
              <Database className="text-gold size-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">Market Intelligence</h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Edit community rental, sales, ROI, demand, and confidence benchmarks
                used on every property details page.
              </p>
              <Button className="larssh-gold-btn mt-4" asChild>
                <Link href="/settings/market-intelligence">Manage database</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
