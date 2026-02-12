import { z } from 'zod';

export enum TaskStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export const Task = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),

  start_datetime: z.string(),
  end_datetime: z.string(),

  created_by_id: z.string(),
  created_by: z.any().optional(), // User type

  assignee_ids: z.array(z.string()),
  attachment_file_ids: z.array(z.string()),

  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type Task = z.infer<typeof Task>;

export const CreateTaskPayload = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),

  start_datetime: z.string(),
  end_datetime: z.string(),
  assignee_ids: z.array(z.string()).optional(),
  attachment_file_ids: z.array(z.string()).optional(),
});

export type CreateTaskPayload = z.infer<typeof CreateTaskPayload>;

export const UpdateTaskPayload = CreateTaskPayload.partial();
export type UpdateTaskPayload = z.infer<typeof UpdateTaskPayload>;
