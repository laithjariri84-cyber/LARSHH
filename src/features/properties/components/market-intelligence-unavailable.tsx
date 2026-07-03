import { SectionCard } from "./section-card";

export function MarketIntelligenceUnavailable() {
  return (
    <SectionCard
      title="Market Intelligence"
      description="Community pricing benchmarks from the LARSSH research database"
      className="border-gold/10"
    >
      <p className="text-muted-foreground rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm">
        Market data not available
      </p>
    </SectionCard>
  );
}
