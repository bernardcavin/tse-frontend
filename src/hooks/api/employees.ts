import { notifications } from '@mantine/notifications';
import { CreateEmployee, User as Employee, UpdateEmployee } from '@/api/entities/auth';
import {
  createDeleteMutationHook,
  createGetQueryHook,
  createPaginationQueryHook,
  createPostMutationHook,
  createPutMutationHook,
  SortableQueryParams,
} from '@/api/helpers';

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
