import {
  AttendanceLocation,
  AttendanceRecord,
  AttendanceRecordUpdate,
  AttendanceStatus_Response,
  CheckInRequest,
  CheckOutRequest,
  LeaveRequest,
  LeaveRequestCreate,
  LeaveRequestUpdate,
} from '@/api/entities/attendance';
import {
  createDeleteMutationHook,
  createGetQueryHook,
  createPaginationQueryHook,
  createPostMutationHook,
  createPutMutationHook,
  SortableQueryParams,
} from '@/api/helpers';
import { notifications } from '@mantine/notifications';


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

export const useCreateAttendanceLocation = createPostMutationHook({
  endpoint: '/attendance/locations',
  bodySchema: AttendanceLocation,

  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-locations'] });
      notifications.show({
        title: 'Success',
        message: 'Attendance location created successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useUpdateAttendanceLocation = createPutMutationHook({
  endpoint: '/attendance/locations/:id',
  bodySchema: AttendanceLocation,

  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-locations'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-location'] });
      notifications.show({
        title: 'Success',
        message: 'Attendance location updated successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useDeleteAttendanceLocation = createDeleteMutationHook({
  endpoint: '/attendance/locations/:id',

  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-locations'] });
      notifications.show({
        title: 'Success',
        message: 'Attendance location deleted successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

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

export const useCheckIn = createPostMutationHook({
  endpoint: '/attendance/check-in',
  bodySchema: CheckInRequest,

  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-status'] });
      notifications.show({
        title: 'Success',
        message: 'Checked in successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  },
});

export const useCheckOut = createPostMutationHook({
  endpoint: '/attendance/check-out',
  bodySchema: CheckOutRequest,

  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-status'] });
      notifications.show({
        title: 'Success',
        message: 'Checked out successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  },
});

export const useGetAttendanceStatus = createGetQueryHook({
  endpoint: '/attendance/status',
  responseSchema: AttendanceStatus_Response,
  rQueryParams: {
    queryKey: ['attendance-status'],
    refetchInterval: 10000,
  },
});

export const useUpdateAttendanceRecord = createPutMutationHook({
  endpoint: '/attendance/records/:id',
  bodySchema: AttendanceRecordUpdate,

  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      notifications.show({
        title: 'Success',
        message: 'Attendance record updated successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  },
});

// ============================================================================
// LEAVE REQUESTS
// ============================================================================

export const useGetLeaveRequests = createPaginationQueryHook<
  typeof LeaveRequest,
  SortableQueryParams
>({
  endpoint: '/attendance/leaves',
  dataSchema: LeaveRequest,
  rQueryParams: { queryKey: ['leave-requests'] },
});

export const useCreateLeaveRequest = createPostMutationHook({
  endpoint: '/attendance/leaves',
  bodySchema: LeaveRequestCreate,

  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      notifications.show({
        title: 'Success',
        message: 'Leave request submitted successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useUpdateLeaveRequestStatus = createPutMutationHook({
  endpoint: '/attendance/leaves/:id/status',
  bodySchema: LeaveRequestUpdate,

  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      notifications.show({
        title: 'Success',
        message: 'Leave request status updated successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});
