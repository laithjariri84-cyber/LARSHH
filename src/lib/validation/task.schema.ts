import { z } from "zod";

import { TaskPriority, TaskStatus } from "@prisma/client";

import { uuidSchema } from "./common.schema";

export const createTaskSchema = z.object({
  propertyId: uuidSchema.nullable().optional(),
  title: z.string().min(1).max(500),
  description: z.string().max(10000).nullable().optional(),
  assigneeUserId: uuidSchema.nullable().optional(),
  assigneeAgentId: uuidSchema.nullable().optional(),
  relatedEntityType: z.string().max(50).nullable().optional(),
  relatedEntityId: uuidSchema.nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  completedAt: z.coerce.date().nullable().optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
