export type DashboardStatTrend = "up" | "down" | "neutral";

export type DashboardStat = {
  label: string;
  value: string;
  change: string;
  trend: DashboardStatTrend;
};

export type DashboardQueryScope = {
  agentId?: string;
};

export type MonthCountPair = {
  currentMonth: number;
  previousMonth: number;
};
