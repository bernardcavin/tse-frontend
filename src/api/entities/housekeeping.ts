import { dateSchema } from '@/utilities/date';
import { z } from 'zod';

// Enum for check status
export const CheckStatus = z.enum(['✔', '✖', 'N/A']);

// Individual checklist item
export const ChecklistItem = z.object({
  item: z.string(),
  status: CheckStatus.optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Main Housekeeping entity
export const Housekeeping = z.object({
  id: z.string().uuid().optional().nullable(),
  location_area: z.string(),
  inspection_date: z.coerce.date(),
  inspector_name: z.string(),
  inspector_id: z.string().uuid(),
  inspector_user_name: z.string().optional().nullable(),
  facility_id: z.string().uuid().optional().nullable(),
  facility_name: z.string().optional().nullable(),
  section_a_items: z.array(ChecklistItem),
  section_b_items: z.array(ChecklistItem),
  section_c_items: z.array(ChecklistItem),
  section_d_items: z.array(ChecklistItem),
  additional_notes: z.string().optional().nullable(),
  created_at: z.coerce.date().optional().nullable(),
  updated_at: z.coerce.date().optional().nullable(),
});

// Create schema
export const HousekeepingCreate = z.object({
  location_area: z.string().min(2).max(255),
  inspection_date: dateSchema,
  inspector_name: z.string().min(2).max(255),
  facility_id: z.string().uuid().optional().nullable(),
  section_a_items: z.array(ChecklistItem).length(5),
  section_b_items: z.array(ChecklistItem).length(5),
  section_c_items: z.array(ChecklistItem).length(5),
  section_d_items: z.array(ChecklistItem).length(5),
  additional_notes: z.string().optional().nullable(),
});

// Update schema
export const HousekeepingUpdate = z.object({
  location_area: z.string().max(255).optional(),
  inspection_date: dateSchema.optional(),
  inspector_name: z.string().max(255).optional(),
  facility_id: z.string().uuid().optional().nullable(),
  section_a_items: z.array(ChecklistItem).optional(),
  section_b_items: z.array(ChecklistItem).optional(),
  section_c_items: z.array(ChecklistItem).optional(),
  section_d_items: z.array(ChecklistItem).optional(),
  additional_notes: z.string().optional().nullable(),
});

// Type exports
export type HousekeepingType = z.infer<typeof Housekeeping>;
export type HousekeepingCreateType = z.infer<typeof HousekeepingCreate>;
export type HousekeepingUpdateType = z.infer<typeof HousekeepingUpdate>;
export type ChecklistItemType = z.infer<typeof ChecklistItem>;
export type CheckStatusType = z.infer<typeof CheckStatus>;
