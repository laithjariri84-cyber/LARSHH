export type PropertyPhoto = {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  sortOrder: number;
  width: number | null;
  height: number | null;
  isPrimary: boolean;
};

export type PropertyVideo = {
  id: string;
  url: string;
  posterUrl: string | null;
  caption: string | null;
  durationSeconds: number | null;
  sortOrder: number;
};

export type PropertyFloorPlan = {
  id: string;
  url: string;
  title: string | null;
  pageCount: number | null;
  sortOrder: number;
};

export type PropertyMediaBundle = {
  photos: PropertyPhoto[];
  videos: PropertyVideo[];
  floorPlans: PropertyFloorPlan[];
};

export type PropertyAmenity = {
  id: string;
  amenityId: string;
  name: string;
  category: string | null;
  notes: string | null;
};

export type PropertyMaintenanceRecord = {
  id: string;
  title: string;
  description: string | null;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduledAt: Date | null;
  completedAt: Date | null;
  cost: number | null;
  currency: string | null;
};

export type PropertyDocument = {
  id: string;
  documentType: string;
  title: string;
  url: string;
  mimeType: string | null;
  uploadedByUserId: string | null;
  createdAt: Date;
};
