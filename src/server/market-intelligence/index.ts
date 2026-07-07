export {
  MARKET_INTELLIGENCE_COMMUNITIES,
  bedroomLabel,
  normalizeBedroomCount,
  resolveCommunitySlug,
} from "./community-matcher";
export {
  formatRentRange,
  buildCommunityMarketSummary,
} from "@/lib/market-intelligence/summary";
export type { CommunityMarketSummary } from "@/lib/market-intelligence/summary";
export {
  getCommunityMarketSummary,
  getCommunityMarketSummaryByName,
  listCommunityMarketSummaries,
} from "./market-intelligence.aggregate";
export {
  findMarketProfile,
  listMarketProfiles,
  listMarketProfilesByCommunitySlug,
  updateMarketProfile,
} from "./market-intelligence.repository";
export { computePropertyMarketIntelligence } from "./market-intelligence.service";
export type {
  CommunityMarketProfileRecord,
  MarketRecommendation,
  PropertyMarketIntelligence,
  RecommendationTone,
  UpdateCommunityMarketProfileInput,
} from "./market-intelligence.types";
