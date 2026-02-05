import { CreateTaskPayload, Task, UpdateTaskPayload } from '@/api/entities/tasks';
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
// TASKS
// ============================================================================

export const useGetTasks = createPaginationQueryHook<
  typeof Task,
  SortableQueryParams
>({
  endpoint: '/tasks',
  dataSchema: Task,
  rQueryParams: { queryKey: ['tasks'] },
});

export const useGetTask = createGetQueryHook({
  endpoint: '/tasks/:id',
  responseSchema: Task,
  rQueryParams: { queryKey: ['task'] },
});

export const useCreateTask = createPostMutationHook({
  endpoint: '/tasks',
  bodySchema: CreateTaskPayload,

  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      notifications.show({
        title: 'Success',
        message: 'Task created successfully',
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

export const useUpdateTask = createPutMutationHook({
  endpoint: '/tasks/:id',
  bodySchema: UpdateTaskPayload,

  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
      notifications.show({
        title: 'Success',
        message: 'Task updated successfully',
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

export const useDeleteTask = createDeleteMutationHook({
  endpoint: '/tasks/:id',

  rMutationParams: {
    onSuccess: (data, variables, context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      notifications.show({
        title: 'Success',
        message: 'Task deleted successfully',
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
