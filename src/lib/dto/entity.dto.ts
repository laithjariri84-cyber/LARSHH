import type { Deal, Offer, Task, Viewing, PriceHistory, MarketStatistics, ComparableProperty } from "@prisma/client";

import { decimalToNumber } from "@/lib/database/utils/decimal";

export type DealDto = Omit<Deal, "offerPrice" | "agreedPrice"> & {
  offerPrice: number | null;
  agreedPrice: number | null;
};

export type OfferDto = Omit<Offer, "offerPrice"> & {
  offerPrice: number;
};

export type PriceHistoryDto = Omit<PriceHistory, "price"> & {
  price: number;
};

export type MarketStatisticsDto = Omit<
  MarketStatistics,
  | "avgAskingPrice"
  | "avgPricePerSqft"
  | "avgRent"
  | "avgRoi"
  | "medianPrice"
  | "lowestPrice"
  | "highestPrice"
  | "marketConfidence"
> & {
  avgAskingPrice: number | null;
  avgPricePerSqft: number | null;
  avgRent: number | null;
  avgRoi: number | null;
  medianPrice: number | null;
  lowestPrice: number | null;
  highestPrice: number | null;
  marketConfidence: number | null;
};

export type ComparablePropertyDto = Omit<
  ComparableProperty,
  "similarityScore" | "priceDifferencePct"
> & {
  similarityScore: number;
  priceDifferencePct: number | null;
};

export function toDealDto(deal: Deal): DealDto {
  return {
    ...deal,
    offerPrice: decimalToNumber(deal.offerPrice),
    agreedPrice: decimalToNumber(deal.agreedPrice),
  };
}

export function toOfferDto(offer: Offer): OfferDto {
  return {
    ...offer,
    offerPrice: decimalToNumber(offer.offerPrice) ?? 0,
  };
}

export function toPriceHistoryDto(row: PriceHistory): PriceHistoryDto {
  return {
    ...row,
    price: decimalToNumber(row.price) ?? 0,
  };
}

export function toMarketStatisticsDto(row: MarketStatistics): MarketStatisticsDto {
  return {
    ...row,
    avgAskingPrice: decimalToNumber(row.avgAskingPrice),
    avgPricePerSqft: decimalToNumber(row.avgPricePerSqft),
    avgRent: decimalToNumber(row.avgRent),
    avgRoi: decimalToNumber(row.avgRoi),
    medianPrice: decimalToNumber(row.medianPrice),
    lowestPrice: decimalToNumber(row.lowestPrice),
    highestPrice: decimalToNumber(row.highestPrice),
    marketConfidence: decimalToNumber(row.marketConfidence),
  };
}

export function toComparablePropertyDto(
  row: ComparableProperty
): ComparablePropertyDto {
  return {
    ...row,
    similarityScore: decimalToNumber(row.similarityScore) ?? 0,
    priceDifferencePct: decimalToNumber(row.priceDifferencePct),
  };
}

export type { Viewing, Task };
