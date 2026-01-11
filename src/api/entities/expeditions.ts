import { User } from '@/api/entities/auth';
import z from 'zod';

export const ExpeditionStatus = z.enum(['active', 'completed', 'cancelled']);
export type ExpeditionStatus = z.infer<typeof ExpeditionStatus>;

export const ExpeditionItem = z.object({
  id: z.string().uuid().optional(),
  expedition_id: z.string().uuid().optional(),
  inventory_id: z.string().uuid(),
  quantity: z.number(),
  confirmed_quantity: z.number().nullable().optional(),
  scanned_at: z.string().nullable().optional(),
  confirmed_at: z.string().nullable().optional(),
  inventory: z.any().optional(),
});

export type ExpeditionItem = z.infer<typeof ExpeditionItem>;

export const Expedition = z.object({
  id: z.string().uuid().optional(),
  employee_id: z.string().uuid(),
  employee: User,
  status: ExpeditionStatus,
  started_at: z.string().nullable().optional(),
  ended_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(ExpeditionItem).default([]),
});

export type Expedition = z.infer<typeof Expedition>;

export const CreateExpedition = z.object({
  notes: z.string().optional(),
});

export type CreateExpedition = z.infer<typeof CreateExpedition>;

export const AddExpeditionItem = z.object({
  inventory_id: z.string().uuid(),
  quantity: z.number().positive(),
});

export type AddExpeditionItem = z.infer<typeof AddExpeditionItem>;

export const UpdateExpeditionItemQuantity = z.object({
  quantity: z.number().positive(),
});

export type UpdateExpeditionItemQuantity = z.infer<typeof UpdateExpeditionItemQuantity>;

export const ConfirmExpeditionItem = z.object({
  confirmed_quantity: z.number().nonnegative(),
});

export type ConfirmExpeditionItem = z.infer<typeof ConfirmExpeditionItem>;

export const EndExpedition = z.object({
  notes: z.string().optional(),
});

export type EndExpedition = z.infer<typeof EndExpedition>;

export const ExpeditionAnalytics = z.object({
  total_expeditions: z.number().default(0),
  active_expeditions: z.number().default(0),
  completed_expeditions: z.number().default(0),
  cancelled_expeditions: z.number().default(0),
  total_items_moved: z.number().default(0),
  items_in_transit: z.number().default(0),
});

export type ExpeditionAnalytics = z.infer<typeof ExpeditionAnalytics>;
