import { z } from 'zod';

export const RequestType = {
  PURCHASE: 'purchase',
  REIMBURSEMENT: 'reimbursement',
} as const;

export const RequestStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  TRANSFERRED: 'transferred',
  REPORTED: 'reported',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const;

export const RequestItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  cost: z.number().min(0, 'Cost must be positive'),
});

export const RequestSchema = z.object({
  id: z.string().uuid(),
  
  // Requester Info
  employee_id: z.string().uuid(),
  employee_name: z.string().optional(),
  
  // Request Details
  type: z.nativeEnum(RequestType),
  purpose: z.string(),
  estimated_cost: z.number(),
  actual_cost: z.number().optional().nullable(),
  items: z.array(RequestItemSchema).optional().nullable(),
  
  // Status
  status: z.nativeEnum(RequestStatus),
  
  // Attachments
  attachment_file_ids: z.array(z.string().uuid()).optional().nullable(),
  transfer_proof_file_ids: z.array(z.string().uuid()).optional().nullable(),
  receipt_file_ids: z.array(z.string().uuid()).optional().nullable(),
  
  // Approval/Rejection Info
  rejection_reason: z.string().optional().nullable(),
  manager_id: z.string().uuid().optional().nullable(),
  manager_name: z.string().optional().nullable(),
  
  // Finance Info
  finance_id: z.string().uuid().optional().nullable(),
  finance_name: z.string().optional().nullable(),
  
  // Metadata
  created_at: z.string(),
  updated_at: z.string(),
});

export const RequestCreateSchema = z.object({
  type: z.nativeEnum(RequestType),
  purpose: z.string().min(1, 'Purpose is required'),
  estimated_cost: z.number().min(0, 'Estimated cost must be positive'),
  items: z.array(RequestItemSchema).optional(),
  attachment_file_ids: z.array(z.string().uuid()).optional(),
});

export const RequestUpdateSchema = z.object({
  type: z.nativeEnum(RequestType).optional(),
  purpose: z.string().min(1).optional(),
  estimated_cost: z.number().min(0).optional(),
  items: z.array(RequestItemSchema).optional(),
  attachment_file_ids: z.array(z.string().uuid()).optional(),
});

export const RequestActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'transfer', 'report', 'done', 'cancel']),
  rejection_reason: z.string().optional(),
  transfer_proof_file_ids: z.array(z.string().uuid()).optional(),
  actual_cost: z.number().optional(),
  receipt_file_ids: z.array(z.string().uuid()).optional(),
});

export type Request = z.infer<typeof RequestSchema>;
export type RequestItem = z.infer<typeof RequestItemSchema>;
export type RequestCreate = z.infer<typeof RequestCreateSchema>;
export type RequestUpdate = z.infer<typeof RequestUpdateSchema>;
export type RequestAction = z.infer<typeof RequestActionSchema>;
