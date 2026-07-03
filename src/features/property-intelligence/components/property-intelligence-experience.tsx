"use client";

import { useMemo, useState } from "react";
import { Activity, Radio } from "lucide-react";

import { useLiveClock } from "@/hooks/use-live-clock";

import { createDefaultIntelligenceFilters } from "../lib/default-filters";
import { generateIntelligenceAnalytics } from "../lib/generate-intelligence-report";
import { AiAssistantPanel, AskAiButton } from "./ai-assistant-panel";
import { IntelligenceComparablesTable } from "./intelligence-comparables-table";
import {
  GenerateIntelligenceReportButton,
  IntelligencePdfDialog,
} from "./intelligence-pdf-dialog";
import { IntelligenceReportGrid } from "./intelligence-report-grid";
import { IntelligenceSearchPanel } from "./intelligence-search-panel";
import { MarketConfidenceGauge } from "./market-confidence-gauge";
import { TerminalDivider } from "./terminal-metric";
import { Badge } from "@/components/ui/badge";

export function PropertyIntelligenceExperience() {
  const [filters, setFilters] = useState(createDefaultIntelligenceFilters);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const analytics = useMemo(
    () => generateIntelligenceAnalytics(filters),
    [filters]
  );

  const timestamp = useLiveClock(
    { hour: "2-digit", minute: "2-digit", second: "2-digit" },
    { placeholder: "--:--:--" }
  );

  return (
    <div className="min-h-full space-y-8 p-4 md:p-6 lg:p-8">
      <header className="animate-slide-up space-y-4">
        <div className="intelligence-terminal overflow-hidden rounded-2xl border border-gold/20">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/10 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <Radio className="text-gold size-4 animate-pulse" />
              <span className="text-gold text-[11px] tracking-[0.25em] uppercase">
                LARSSH Terminal
              </span>
              <Badge variant="outline" className="border-emerald-500/30 text-[10px] text-emerald-400">
                LIVE PREVIEW
              </Badge>
            </div>
            <p className="intelligence-ticker text-muted-foreground font-mono text-xs">
              {timestamp} · {analytics.scopeLabel}
            </p>
          </div>

          <div className="px-4 py-6 md:px-6 md:py-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-gold text-sm font-medium tracking-[0.2em] uppercase">
                  Property Intelligence
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
                  Intelligence Terminal
                </h1>
                <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-7 md:text-base">
                  Bloomberg-grade property intelligence for pricing, confidence,
                  comparables, and advisory output — built for institutional decision
                  velocity.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <GenerateIntelligenceReportButton onClick={() => setPdfOpen(true)} />
                <AskAiButton onClick={() => setAiOpen(true)} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <IntelligenceSearchPanel
        filters={filters}
        onChange={setFilters}
        scopeLabel={analytics.scopeLabel}
      />

      <TerminalDivider />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <IntelligenceReportGrid report={analytics.report} purpose={filters.purpose} />
          <IntelligenceComparablesTable
            listings={analytics.comparables}
            purpose={filters.purpose}
          />
        </div>

        <aside className="space-y-4">
          <MarketConfidenceGauge score={analytics.report.marketConfidence} />
          <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
            <div className="flex items-center gap-2">
              <Activity className="text-gold size-4" />
              <h3 className="text-sm font-semibold">Signal Summary</h3>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <SignalRow label="Investment Score" value={`${analytics.report.investmentScore}/100`} />
              <SignalRow label="Holiday Home Score" value={`${analytics.report.holidayHomeScore}/100`} />
              <SignalRow label="Rental Yield" value={`${analytics.report.rentalYield}%`} />
              <SignalRow label="Supply" value={analytics.report.supplyLevel} />
              <SignalRow label="Demand" value={analytics.report.demandLevel} />
            </dl>
          </div>
        </aside>
      </div>

      <IntelligencePdfDialog
        open={pdfOpen}
        onOpenChange={setPdfOpen}
        filters={filters}
        analytics={analytics}
      />

      <AiAssistantPanel
        open={aiOpen}
        onOpenChange={setAiOpen}
        filters={filters}
        analytics={analytics}
      />
    </div>
  );
}

function SignalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="intelligence-ticker font-mono font-medium">{value}</dd>
    </div>
  );
}
