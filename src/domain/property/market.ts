export type PropertyMarketStatistics = {
  scopeKey: string;
  computedAt: Date;
  averageAskingPrice: number | null;
  averagePricePerSqft: number | null;
  averageRent: number | null;
  averageRoi: number | null;
  averageDaysOnMarket: number | null;
  medianPrice: number | null;
  lowestPrice: number | null;
  highestPrice: number | null;
  supplyLevel: string | null;
  demandLevel: string | null;
  marketConfidence: number | null;
  activeListingsCount: number;
};

export type ComparablePropertyRecord = {
  id: string;
  comparablePropertyId: string;
  propertyCode: string;
  buildingName: string;
  size: number | null;
  price: number | null;
  pricePerSqft: number | null;
  differencePercent: number | null;
  similarityScore: number;
  status: string | null;
};

export type PropertyROI = {
  grossRentalYield: number | null;
  netRentalYield: number | null;
  estimatedAnnualRent: number | null;
  estimatedCapitalAppreciation: number | null;
  investmentScore: number | null;
  computedAt: Date;
};

export type HolidayHomeData = {
  holidayHomeScore: number | null;
  averageOccupancyRate: number | null;
  averageNightlyRate: number | null;
  peakSeason: string | null;
  shortStayAllowed: boolean;
  managementCompany: string | null;
  notes: string | null;
};

export type PropertyMarketBundle = {
  statistics: PropertyMarketStatistics | null;
  comparables: ComparablePropertyRecord[];
  roi: PropertyROI | null;
  holidayHome: HolidayHomeData | null;
};
