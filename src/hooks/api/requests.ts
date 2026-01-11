import { RequestActionSchema, RequestCreateSchema, RequestSchema, RequestUpdateSchema } from '@/api/entities/requests';
import {
    createDeleteMutationHook,
    createGetQueryHook,
    createPaginationQueryHook,
    createPostMutationHook,
    createPutMutationHook,
    SortableQueryParams,
} from '@/api/helpers';
import { notifications } from '@mantine/notifications';

export const useRequests = createPaginationQueryHook<typeof RequestSchema, SortableQueryParams>({
  endpoint: '/requests',
  dataSchema: RequestSchema,
  rQueryParams: { queryKey: ['requests'] },
});

export const useRequest = createGetQueryHook({
  endpoint: '/requests/:id',
  responseSchema: RequestSchema,
  rQueryParams: { queryKey: ['request'] },
});

export const useCreateRequest = createPostMutationHook({
  endpoint: '/requests',
  bodySchema: RequestCreateSchema,
  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Request created successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to create request',
        color: 'red',
      });
    },
  },
});

export const useUpdateRequest = createPutMutationHook({
  endpoint: '/requests/:id',
  bodySchema: RequestUpdateSchema,
  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Request updated successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update request',
        color: 'red',
      });
    },
  },
});

export const useDeleteRequest = createDeleteMutationHook({
  endpoint: '/requests/:id',
  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Request deleted successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to delete request',
        color: 'red',
      });
    },
  },
});

export const useRequestAction = createPostMutationHook({
  endpoint: '/requests/:id/action',
  bodySchema: RequestActionSchema,
  rMutationParams: {
    onSuccess: (data, variables) => {
      // We can customize message based on action if needed, but variables might not be easily accessible here in a generic way 
      // unless we check how createPostMutationHook passes them. 
      // Usually it's (data, variables, context).
      notifications.show({
        title: 'Success',
        message: 'Request action performed successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to perform action',
        color: 'red',
      });
    },
  },
});
