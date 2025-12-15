import { z } from 'zod';
import { Facility } from '@/api/entities/facility';
import { dateSchema } from '@/utilities/date';

export const LocationStatus = z.enum(['in_storage', 'in_transit']);

export const Inventory = z.object({
  id: z.string().uuid().optional().nullable(),
  item_name: z.string(),
  item_description: z.string().optional().nullable(),
  item_category: z.string(),
  item_code: z.string(),
  manufacturer: z.string().optional().nullable(),
  supplier: z.string().optional().nullable(),
  quantity: z.number(),
  quantity_uom: z.string(),
  minimum_stock_level: z.number().default(0),
  reorder_level: z.number().optional().nullable(),
  storage_location_id: z.string().uuid(),
  storage_location: Facility.optional().nullable(),
  location_status: LocationStatus,
  current_latitude: z.number().optional().nullable(),
  current_longitude: z.number().optional().nullable(),
  assigned_department: z.string().optional().nullable(),
  assigned_personnel: z.string().optional().nullable(),
  asset_tag: z.string().optional().nullable(),
  condition_status: z.string(),
  inspection_required: z.boolean().default(false),
  last_inspection_date: dateSchema.optional().nullable(),
  next_inspection_due: dateSchema.optional().nullable(),
  certification_expiry_date: dateSchema.optional().nullable(),
  safety_data_sheet_available: z.boolean().default(false),
  purchase_date: dateSchema.optional().nullable(),
  expiry_date: dateSchema.optional().nullable(),
  is_active: z.boolean().default(true),
  photo_file_ids: z.array(z.string()).optional().nullable(),
  attachment_file_ids: z.array(z.string()).optional().nullable(),
});
