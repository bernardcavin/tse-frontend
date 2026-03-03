import { z } from 'zod';

export const AttendanceStatus = z.enum(['checked_in', 'checked_out']);

export const AttendanceLocation = z.object({
  id: z.string().uuid().optional().nullable(),
  location_name: z.string(),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  radius_meters: z.number().int().min(1).max(10000).default(100),
  attendance_max_time: z.string().optional().nullable(),
  qr_code_data: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  created_by_id: z.string().uuid().optional().nullable(),
  created_at: z.coerce.date().optional().nullable(),
  updated_at: z.coerce.date().optional().nullable(),
});

export const AttendanceRecord = z.object({
  id: z.string().uuid().optional().nullable(),
  user_id: z.string().uuid(),
  location_id: z.string().uuid(),
  employee_name: z.string().optional().nullable(),
  location_name: z.string().optional().nullable(),
  check_in_time: z.coerce.date(),
  check_in_latitude: z.number().optional().nullable(),
  check_in_longitude: z.number().optional().nullable(),
  check_out_time: z.coerce.date().optional().nullable(),
  check_out_latitude: z.number().optional().nullable(),
  check_out_longitude: z.number().optional().nullable(),
  status: AttendanceStatus,
  notes: z.string().optional().nullable(),
  created_at: z.coerce.date().optional().nullable(),
  updated_at: z.coerce.date().optional().nullable(),
});

export const CheckInRequest = z.object({
  location_id: z.string().uuid(),
  qr_code_data: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  face_embedding: z.array(z.number()),
});

export const CheckOutRequest = z.object({
  attendance_record_id: z.string().uuid(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  face_embedding: z.array(z.number()),
});

export const AttendanceStatus_Response = z.object({
  active_check_in: AttendanceRecord.nullable(),
  is_checked_in: z.boolean(),
});

export const AttendanceRecordUpdate = z.object({
  notes: z.string().optional().nullable(),
});

// Leave Management

export const LeaveRequestType = z.enum([
  'sick',
  'paid',
  'unpaid',
  'maternity',
  'paternity',
  'other',
]);

export const LeaveRequestStatus = z.enum([
  'pending',
  'approved',
  'rejected',
  'cancelled',
]);

export const LeaveRequest = z.object({
  id: z.string().uuid().optional().nullable(),
  user_id: z.string().uuid(),
  employee_name: z.string().optional().nullable(),
  leave_type: LeaveRequestType,
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  reason: z.string(),
  attachment_file_ids: z.array(z.string().uuid()).optional().nullable(),
  status: LeaveRequestStatus.default('pending'),
  rejection_reason: z.string().optional().nullable(),
  manager_id: z.string().uuid().optional().nullable(),
  manager_name: z.string().optional().nullable(),
  approved_at: z.coerce.date().optional().nullable(),
  created_at: z.coerce.date().optional().nullable(),
  updated_at: z.coerce.date().optional().nullable(),
});

export const LeaveRequestCreate = z.object({
  leave_type: LeaveRequestType,
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  reason: z.string().min(1, 'Reason is required'),
  attachment_file_ids: z.array(z.string().uuid()).optional().default([]),
});

export const LeaveRequestUpdate = z.object({
  status: LeaveRequestStatus,
  rejection_reason: z.string().optional().nullable(),
});
