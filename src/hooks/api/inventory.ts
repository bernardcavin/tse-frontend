import { notifications } from '@mantine/notifications';
import { Inventory } from '@/api/entities/inventory';
import {
  createDeleteMutationHook,
  createGetQueryHook,
  createPaginationQueryHook,
  createPostMutationHook,
  createPutMutationHook,
  SortableQueryParams,
} from '@/api/helpers';

export const useGetInventoryList = createPaginationQueryHook<typeof Inventory, SortableQueryParams>(
  {
    endpoint: '/inventory',
    dataSchema: Inventory,
    rQueryParams: { queryKey: ['inventory'] },
  }
);

export const useGetInventory = createGetQueryHook({
  endpoint: '/inventory/:id',
  responseSchema: Inventory,
  rQueryParams: { queryKey: ['inventory'] },
});

export const useCreateInventory = createPostMutationHook({
  endpoint: '/inventory',
  bodySchema: Inventory,

  rMutationParams: {
    onSuccess: (data) => {
      notifications.show({
        title: 'Berhasil',
        message: 'Inventory berhasil dibuat',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
  options: {
    isMultipart: false,
  },
});

export const useEditInventory = createPutMutationHook({
  endpoint: '/inventory/:id',
  bodySchema: Inventory,

  rMutationParams: {
    onSuccess: (data) => {
      notifications.show({
        title: 'Berhasil',
        message: 'Inventory berhasil diubah',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useDeleteInventory = createDeleteMutationHook({
  endpoint: '/inventory/:id',

  rMutationParams: {
    onSuccess: (data) => {
      notifications.show({
        title: 'Berhasil',
        message: 'Inventory berhasil dihapus',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});
