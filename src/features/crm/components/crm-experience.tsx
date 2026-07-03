"use client";

import { useState } from "react";
import { Briefcase } from "lucide-react";

import {
  mockCrmStats,
  mockDeals,
  mockLeads,
  mockTasks,
  mockViewings,
} from "../data/mock-crm-data";
import type { CrmModule } from "../types";
import { CrmModuleTabs } from "./crm-module-tabs";
import { CrmStatsCards } from "./crm-stats-cards";
import { DealsPipeline } from "./deals/deals-pipeline";
import { LeadsKanbanBoard } from "./leads/leads-kanban-board";
import { TasksModule } from "./tasks/tasks-module";
import { ViewingsModule } from "./viewings/viewings-module";
import { Badge } from "@/components/ui/badge";
import { LARSSH_BRAND } from "@/lib/brand";

export function CrmExperience() {
  const [activeModule, setActiveModule] = useState<CrmModule>("leads");

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <header className="animate-slide-up">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-gold/20 bg-gold-muted text-gold text-[10px]"
              >
                {LARSSH_BRAND.shortTagline}
              </Badge>
              <Badge variant="outline" className="border-white/10 text-[10px]">
                Mock CRM preview
              </Badge>
            </div>
            <p className="text-gold mt-4 text-sm font-medium tracking-[0.2em] uppercase">
              LARSSH
            </p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight md:text-4xl">
              <Briefcase className="text-gold size-8" />
              CRM
            </h1>
            <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-7 md:text-base">
              Enterprise pipeline for leads, viewings, tasks, and deals — designed
              for advisory teams operating at HubSpot and Salesforce velocity.
            </p>
          </div>
        </div>
      </header>

      <CrmStatsCards stats={mockCrmStats} />

      <CrmModuleTabs active={activeModule} onChange={setActiveModule} />

      <div className="animate-slide-up">
        {activeModule === "leads" ? <LeadsKanbanBoard leads={mockLeads} /> : null}
        {activeModule === "viewings" ? (
          <ViewingsModule viewings={mockViewings} />
        ) : null}
        {activeModule === "tasks" ? <TasksModule tasks={mockTasks} /> : null}
        {activeModule === "deals" ? <DealsPipeline deals={mockDeals} /> : null}
      </div>
    </div>
  );
}
