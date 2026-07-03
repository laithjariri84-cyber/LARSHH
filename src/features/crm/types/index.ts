export type LeadPriority = "high" | "medium" | "low";

export type LeadStage =
  | "new_lead"
  | "contacted"
  | "viewing_scheduled"
  | "negotiating"
  | "closed_won"
  | "closed_lost";

export type Lead = {
  id: string;
  stage: LeadStage;
  clientName: string;
  phone: string;
  budget: number;
  preferredArea: string;
  bedrooms: string;
  assignedAgent: string;
  nextFollowUp: string;
  priority: LeadPriority;
};

export type ViewingStatus = "upcoming" | "today" | "past";

export type Viewing = {
  id: string;
  date: string;
  time: string;
  property: string;
  client: string;
  agent: string;
  notes: string;
  status: ViewingStatus;
};

export type TaskCategory = "daily" | "overdue" | "completed" | "recurring";

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  assignee: string;
  category: TaskCategory;
  priority: LeadPriority;
  recurringLabel?: string;
};

export type DealStage =
  | "offer_sent"
  | "offer_accepted"
  | "contract"
  | "transfer"
  | "completed";

export type Deal = {
  id: string;
  stage: DealStage;
  clientName: string;
  property: string;
  value: number;
  commission: number;
  agent: string;
  expectedClose: string;
};

export type CrmStats = {
  todaysCalls: number;
  todaysViewings: number;
  offersSent: number;
  dealsClosed: number;
  revenue: number;
  commission: number;
};

export type CrmModule = "leads" | "viewings" | "tasks" | "deals";

export type PipelineColumn<T extends string> = {
  id: T;
  label: string;
};
