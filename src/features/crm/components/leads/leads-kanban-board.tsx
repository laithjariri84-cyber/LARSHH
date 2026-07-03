import type { Lead } from "../../types";
import { LEAD_COLUMNS } from "../../data/mock-crm-data";
import { LeadCard } from "./lead-card";

type LeadsKanbanBoardProps = {
  leads: Lead[];
};

export function LeadsKanbanBoard({ leads }: LeadsKanbanBoardProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-4">
        {LEAD_COLUMNS.map((column) => {
          const columnLeads = leads.filter((lead) => lead.stage === column.id);

          return (
            <div
              key={column.id}
              className="flex w-[300px] shrink-0 flex-col rounded-2xl border border-white/5 bg-white/[0.02]"
            >
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <h3 className="text-sm font-semibold">{column.label}</h3>
                <span className="text-muted-foreground rounded-full bg-white/5 px-2 py-0.5 text-xs">
                  {columnLeads.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-3">
                {columnLeads.length > 0 ? (
                  columnLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
                ) : (
                  <div className="text-muted-foreground rounded-xl border border-dashed border-white/10 px-3 py-8 text-center text-xs">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
