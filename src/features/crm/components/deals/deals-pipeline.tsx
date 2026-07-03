import type { Deal } from "../../types";
import { DEAL_COLUMNS } from "../../data/mock-crm-data";
import { formatCurrency } from "../../lib/formatters";
import { DealCard } from "./deal-card";

type DealsPipelineProps = {
  deals: Deal[];
};

export function DealsPipeline({ deals }: DealsPipelineProps) {
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          Pipeline value{" "}
          <span className="text-foreground font-semibold">
            {formatCurrency(totalValue)}
          </span>
        </p>
        <p className="text-muted-foreground text-sm">
          {deals.length} active deals in pipeline
        </p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-4">
          {DEAL_COLUMNS.map((column) => {
            const columnDeals = deals.filter((deal) => deal.stage === column.id);
            const columnValue = columnDeals.reduce(
              (sum, deal) => sum + deal.value,
              0
            );

            return (
              <div
                key={column.id}
                className="flex w-[280px] shrink-0 flex-col rounded-2xl border border-white/5 bg-white/[0.02]"
              >
                <div className="border-b border-white/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{column.label}</h3>
                    <span className="text-muted-foreground text-xs">
                      {columnDeals.length}
                    </span>
                  </div>
                  <p className="text-gold mt-1 text-xs font-medium">
                    {formatCurrency(columnValue)}
                  </p>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-3">
                  {columnDeals.length > 0 ? (
                    columnDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)
                  ) : (
                    <div className="text-muted-foreground rounded-xl border border-dashed border-white/10 px-3 py-8 text-center text-xs">
                      No deals in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
