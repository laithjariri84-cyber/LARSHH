export type DashboardStatTrend = "up" | "down" | "neutral";

export type DashboardStat = {
  label: string;
  value: string;
  change: string;
  trend: DashboardStatTrend;
};

export type DashboardQueryScope = {
  agentId?: string;
  /** When true, listing widgets and metrics return empty/zero (founder admin view). */
  noListings?: boolean;
};

export type MonthCountPair = {
  currentMonth: number;
  previousMonth: number;
};
