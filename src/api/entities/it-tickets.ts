import { z } from 'zod';

// Enums
export const TicketStatus = z.enum(['open', 'in_progress', 'resolved', 'closed']);
export const TicketCategory = z.enum(['hardware', 'software', 'network', 'account_access', 'other']);
export const TicketPriority = z.enum(['low', 'medium', 'high', 'critical']);

// Main entity
export const ITTicket = z.object({
  id: z.string().uuid().optional().nullable(),
  photo_file_ids: z.array(z.string().uuid()).optional().nullable(),
  title: z.string(),
  description: z.string(),
  category: TicketCategory,
  priority: TicketPriority,
  reporter_id: z.string().uuid(),
  reporter_name: z.string().optional().nullable(),
  facility_id: z.string().uuid().optional().nullable(),
  facility_name: z.string().optional().nullable(),
  inventory_item_id: z.string().uuid().optional().nullable(),
  inventory_item_name: z.string().optional().nullable(),
  assigned_to_id: z.string().uuid().optional().nullable(),
  assigned_to_name: z.string().optional().nullable(),
  status: TicketStatus,
  resolved_by_id: z.string().uuid().optional().nullable(),
  resolved_by_name: z.string().optional().nullable(),
  resolved_at: z.coerce.date().optional().nullable(),
  resolution_notes: z.string().optional().nullable(),
  created_at: z.coerce.date().optional().nullable(),
  updated_at: z.coerce.date().optional().nullable(),
});

// Create schema
export const ITTicketCreate = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(10),
  category: TicketCategory.default('other'),
  priority: TicketPriority.default('medium'),
  facility_id: z.string().uuid().optional().nullable(),
  inventory_item_id: z.string().uuid().optional().nullable(),
  photo_file_ids: z.array(z.string().uuid()).optional().nullable(),
});

// Update schema
export const ITTicketUpdate = z.object({
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  category: TicketCategory.optional(),
  priority: TicketPriority.optional(),
  facility_id: z.string().uuid().optional().nullable(),
  inventory_item_id: z.string().uuid().optional().nullable(),
  status: TicketStatus.optional(),
  photo_file_ids: z.array(z.string().uuid()).optional().nullable(),
});

// Resolve schema
export const ITTicketResolve = z.object({
  resolution_notes: z.string().min(10),
});

// Assign schema
export const ITTicketAssign = z.object({
  assigned_to_id: z.string().uuid(),
});

// Type exports
export type ITTicketType = z.infer<typeof ITTicket>;
export type ITTicketCreateType = z.infer<typeof ITTicketCreate>;
export type ITTicketUpdateType = z.infer<typeof ITTicketUpdate>;
export type ITTicketResolveType = z.infer<typeof ITTicketResolve>;
export type ITTicketAssignType = z.infer<typeof ITTicketAssign>;
export type TicketStatusType = z.infer<typeof TicketStatus>;
export type TicketCategoryType = z.infer<typeof TicketCategory>;
export type TicketPriorityType = z.infer<typeof TicketPriority>;
