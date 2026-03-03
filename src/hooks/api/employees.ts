import { CreateEmployee, User as Employee, UpdateEmployee } from '@/api/entities/auth';
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
// QUERIES
// ============================================================================

export const useGetEmployeeList = createPaginationQueryHook<typeof Employee, SortableQueryParams>({
  endpoint: '/auth/employees',
  dataSchema: Employee,
  rQueryParams: {
    queryKey: ['employees'],
  },
});

// (Optional – only if you have /employees/:id)
export const useGetEmployee = createGetQueryHook({
  endpoint: '/auth/employees/:id',
  responseSchema: Employee,
  rQueryParams: {
    queryKey: ['employee'],
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

export const useCreateEmployee = createPostMutationHook({
  endpoint: '/auth/employees',
  bodySchema: CreateEmployee,

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Employee created successfully',
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

export const useUpdateEmployee = createPutMutationHook({
  endpoint: '/auth/employees/:id',
  bodySchema: UpdateEmployee,

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Employee updated successfully',
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

export const useDeleteEmployee = createDeleteMutationHook({
  endpoint: '/auth/employees/:id',

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Employee deleted successfully',
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

import { clearEmployeeFace, clearOwnFace, enrollFace } from '@/api/resources/auth';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useEnrollFace = () => {
  const queryClient = useQueryClient();
  const { refreshUserInfo } = useAuth();
  return useMutation({
    mutationFn: (embedding: number[]) => enrollFace(embedding),
    onSuccess: () => {
      refreshUserInfo();
      queryClient.invalidateQueries({ queryKey: ['attendance-status'] });
      notifications.show({
        title: 'Success',
        message: 'Face enrolled successfully',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to enroll face',
        color: 'red',
      });
    }
  });
};

export const useClearOwnFace = () => {
  const queryClient = useQueryClient();
  const { refreshUserInfo } = useAuth();
  return useMutation({
    mutationFn: () => clearOwnFace(),
    onSuccess: () => {
      refreshUserInfo();
      queryClient.invalidateQueries({ queryKey: ['attendance-status'] });
      notifications.show({
        title: 'Success',
        message: 'Face enrollment cleared',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to clear face',
        color: 'red',
      });
    }
  });
};

export const useClearEmployeeFace = () => {
  const queryClient = useQueryClient();
  const { refreshUserInfo } = useAuth();
  return useMutation({
    mutationFn: (employeeId: string) => clearEmployeeFace(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      refreshUserInfo();
      notifications.show({
        title: 'Success',
        message: 'Employee face enrollment cleared',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to clear face',
        color: 'red',
      });
    }
  });
};
