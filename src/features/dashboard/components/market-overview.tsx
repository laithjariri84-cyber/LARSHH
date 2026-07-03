import { TrendingUp } from "lucide-react";



import { Sparkline } from "@/components/ui/sparkline";

import type { MarketOverviewCard } from "../data/mock-dashboard";



type MarketOverviewProps = {
  cards: MarketOverviewCard[];
};



export function MarketOverview({ cards }: MarketOverviewProps) {

  return (

    <section className="space-y-5">

      <div className="flex items-center justify-between">

        <h2 className="larssh-heading-lg">Market Overview</h2>

        <span className="text-muted-foreground text-xs">Last 30 days</span>

      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

        {cards.map((card, index) => (

          <div

            key={card.title}

            className="larssh-card larssh-card-hover animate-slide-up rounded-2xl p-6"

            style={{ animationDelay: `${index * 60}ms` }}

          >

            <div className="flex items-start justify-between gap-3">

              <p className="text-muted-foreground text-sm">{card.title}</p>

              <Sparkline trend="up" />

            </div>

            <p className="mt-3 text-2xl font-semibold tracking-tight">{card.value}</p>

            <p className="text-muted-foreground mt-1 text-xs">{card.subtitle}</p>
            {card.trend ? (
              <p className="text-gold/90 mt-4 flex items-center gap-1 text-xs font-medium">
                <TrendingUp className="size-3" />
                {card.trend}
              </p>
            ) : null}

          </div>

        ))}

      </div>

    </section>

  );

}

