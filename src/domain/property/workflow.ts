import type { DealStatus, ViewingStatus } from "@prisma/client";

export type PropertyViewingRecord = {
  id: string;
  listingId: string;
  agentId: string;
  buyerId: string | null;
  tenantId: string | null;
  scheduledAt: Date;
  durationMinutes: number;
  status: ViewingStatus;
  notes: string | null;
};

/** Offer / deal in the context of this property's listing pipeline. */
export type PropertyOfferRecord = {
  id: string;
  listingId: string;
  buyerId: string;
  agentId: string;
  status: DealStatus;
  offerPrice: number | null;
  agreedPrice: number | null;
  currency: string;
  openedAt: Date;
  closedAt: Date | null;
};

export type PropertyTaskRecord = {
  id: string;
  title: string;
  description: string | null;
  assigneeUserId: string | null;
  assigneeAgentId: string | null;
  dueAt: Date | null;
  completedAt: Date | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed" | "cancelled";
};

export type PropertyNoteRecord = {
  id: string;
  authorUserId: string;
  body: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PropertyWorkflowBundle = {
  viewings: PropertyViewingRecord[];
  offers: PropertyOfferRecord[];
  tasks: PropertyTaskRecord[];
  notes: PropertyNoteRecord[];
};
