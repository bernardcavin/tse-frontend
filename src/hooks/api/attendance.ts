import {
  AttendanceLocation,
  AttendanceRecord
} from '@/api/entities/attendance';
import {
  createGetQueryHook,
  createPaginationQueryHook,
  SortableQueryParams,
} from '@/api/helpers';
import {
  checkIn,
  checkOut,
  createAttendanceLocation,
  deleteAttendanceLocation,
  updateAttendanceLocation,
} from '@/api/resources/attendance';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// ATTENDANCE LOCATIONS
// ============================================================================

export const useGetAttendanceLocations = createPaginationQueryHook<
  typeof AttendanceLocation,
  SortableQueryParams
>({
  endpoint: '/attendance/locations',
  dataSchema: AttendanceLocation,
  rQueryParams: { queryKey: ['attendance-locations'] },
});

export const useGetAttendanceLocation = createGetQueryHook({
  endpoint: '/attendance/locations/:id',
  responseSchema: AttendanceLocation,
  rQueryParams: { queryKey: ['attendance-location'] },
});

export function useCreateAttendanceLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => createAttendanceLocation(data.variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-locations'] });
      notifications.show({
        title: 'Success',
        message: 'Attendance location created successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  });
}

export function useUpdateAttendanceLocation({ route }: { route: { id: string } }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => updateAttendanceLocation(route.id, data.variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-locations'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-location'] });
      notifications.show({
        title: 'Success',
        message: 'Attendance location updated successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  });
}

export function useDeleteAttendanceLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { route: { id: string } }) => deleteAttendanceLocation(data.route.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-locations'] });
      notifications.show({
        title: 'Success',
        message: 'Attendance location deleted successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  });
}

// ============================================================================
// ATTENDANCE RECORDS
// ============================================================================

export const useGetAttendanceRecords = createPaginationQueryHook<
  typeof AttendanceRecord,
  SortableQueryParams & { user_id?: string; start_date?: string; end_date?: string }
>({
  endpoint: '/attendance/records',
  dataSchema: AttendanceRecord,
  rQueryParams: { queryKey: ['attendance-records'] },
});

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => checkIn(data.variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-status'] });
      notifications.show({
        title: 'Success',
        message: 'Checked in successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => checkOut(data.variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-status'] });
      notifications.show({
        title: 'Success',
        message: 'Checked out successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  });
}

export const useGetAttendanceStatus = createGetQueryHook({
  endpoint: '/attendance/status',
  responseSchema: AttendanceRecord.nullable(),
  rQueryParams: {
    queryKey: ['attendance-status'],
    refetchInterval: 10000, // Refetch every 10 seconds
  },
});
