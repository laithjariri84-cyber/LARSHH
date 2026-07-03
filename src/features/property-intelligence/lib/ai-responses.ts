import type {
  AiQuestion,
  AiQuestionId,
  IntelligenceAnalytics,
  IntelligenceFilters,
} from "../types";
import {
  formatCurrency,
  formatTrend,
} from "./generate-intelligence-report";

export const AI_QUESTIONS: AiQuestion[] = [
  {
    id: "overpriced",
    label: "Is this property overpriced?",
    prompt: "Is this property overpriced?",
  },
  {
    id: "listing_price",
    label: "What should I list this property for?",
    prompt: "What should I list this property for?",
  },
  {
    id: "time_to_sell",
    label: "How long will it take to sell?",
    prompt: "How long will it take to sell?",
  },
  {
    id: "comparables",
    label: "Show comparable properties",
    prompt: "Show comparable properties.",
  },
  {
    id: "negotiation",
    label: "Give me a negotiation strategy",
    prompt: "Give me a negotiation strategy.",
  },
];

export function generateAiResponse(
  questionId: AiQuestionId,
  filters: IntelligenceFilters,
  analytics: IntelligenceAnalytics
): string {
  const { report, comparables, scopeLabel } = analytics;
  const priceLabel = formatCurrency(report.estimatedMarketValue, filters.purpose);

  switch (questionId) {
    case "overpriced":
      return `Based on ${scopeLabel}, the estimated market value is ${priceLabel}. With an average asking spread of ${formatCurrency(report.highestAskingPrice - report.lowestAskingPrice, filters.purpose)} across ${comparables.length} comparables, current positioning appears ${report.marketConfidence >= 92 ? "aligned with market" : "slightly above median"}. Market confidence is ${report.marketConfidence}%. Recommendation: ${report.suggestedListingPrice > report.estimatedMarketValue ? "trim list price by 2–4% to accelerate absorption" : "pricing is defensible for premium view inventory"}.`;

    case "listing_price":
      return `For ${scopeLabel}, LARSSH suggests listing at ${formatCurrency(report.suggestedListingPrice, filters.purpose)} with a negotiation corridor toward ${formatCurrency(report.suggestedClosingPrice, filters.purpose)}. This reflects ${formatTrend(report.priceTrend)} price momentum and ${report.demandLevel.toLowerCase()} demand in the micro-market.`;

    case "time_to_sell":
      return `Expected time-on-market for this profile is ${report.averageDaysOnMarket} days at the suggested list price. With ${report.demandLevel} demand and ${report.supplyLevel.toLowerCase()} supply, a well-positioned ${filters.propertyType} in ${filters.community} typically absorbs within ${Math.max(report.averageDaysOnMarket - 8, 12)}–${report.averageDaysOnMarket + 12} days if priced within 3% of ${formatCurrency(report.estimatedMarketValue, filters.purpose)}.`;

    case "comparables":
      return comparables
        .slice(0, 5)
        .map(
          (item, index) =>
            `${index + 1}. ${item.building} · ${item.size.toLocaleString()} sqft · ${formatCurrency(item.price, filters.purpose)} · ${item.differencePercent > 0 ? "+" : ""}${item.differencePercent}% vs market · ${item.status}`
        )
        .join("\n\n");

    case "negotiation":
      return `Negotiation strategy for ${filters.building}:\n\n• Anchor buyer expectations using ${formatCurrency(report.estimatedMarketValue, filters.purpose)} as fair value.\n• Lead with ${comparables.filter((item) => item.differencePercent < 0).length} under-market comps to justify ${formatCurrency(report.suggestedClosingPrice, filters.purpose)}.\n• If buyer cites ${report.supplyLevel.toLowerCase()} supply, counter with ${report.demandLevel.toLowerCase()} demand and ${report.rentalYield}% rental yield for investors.\n• Target close at ${formatCurrency(report.suggestedClosingPrice, filters.purpose)} with ${filters.furnishing.toLowerCase()} inventory premium for ${filters.view.toLowerCase()}.`;

    default:
      return "Intelligence preview is active. Select a guided question to generate advisory output.";
  }
}
