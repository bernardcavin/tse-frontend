import { BackendResponse } from '@/api/entities';
import {
    AttendanceLocation,
    AttendanceRecord,
    AttendanceStatus_Response,
    CheckInRequest,
    CheckOutRequest,
} from '@/api/entities/attendance';
import { client } from '../axios';

// ============================================================================
// ATTENDANCE LOCATIONS
// ============================================================================

export async function createAttendanceLocation(
  data: ReturnType<typeof AttendanceLocation.parse>
) {
  const response = await client.post('attendance/locations', data);
  return AttendanceLocation.parse(BackendResponse.parse(response.data).data);
}

export async function updateAttendanceLocation(
  id: string,
  data: ReturnType<typeof AttendanceLocation.parse>
) {
  const response = await client.put(`attendance/locations/${id}`, data);
  return AttendanceLocation.parse(BackendResponse.parse(response.data).data);
}

export async function deleteAttendanceLocation(id: string) {
  const response = await client.delete(`attendance/locations/${id}`);
  return BackendResponse.parse(response.data);
}

export async function getAttendanceLocation(id: string) {
  const response = await client.get(`attendance/locations/${id}`);
  return AttendanceLocation.parse(BackendResponse.parse(response.data).data);
}

// ============================================================================
// ATTENDANCE RECORDS
// ============================================================================

export async function checkIn(data: ReturnType<typeof CheckInRequest.parse>) {
  const response = await client.post('attendance/check-in', data);
  return AttendanceRecord.parse(BackendResponse.parse(response.data).data);
}

export async function checkOut(data: ReturnType<typeof CheckOutRequest.parse>) {
  const response = await client.post('attendance/check-out', data);
  return AttendanceRecord.parse(BackendResponse.parse(response.data).data);
}

export async function getAttendanceStatus() {
  const response = await client.get('attendance/status');
  return AttendanceStatus_Response.parse(BackendResponse.parse(response.data).data);
}
