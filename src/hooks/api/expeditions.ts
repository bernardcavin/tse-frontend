import {
  AddExpeditionItem,
  ConfirmExpeditionItem,
  CreateExpedition,
  EndExpedition,
  Expedition,
  ExpeditionAnalytics,
  UpdateExpeditionItemQuantity,
} from '@/api/entities/expeditions';
import {
  createDeleteMutationHook,
  createGetQueryHook,
  createPaginationQueryHook,
  createPostMutationHook,
  createPutMutationHook,
  SortableQueryParams,
} from '@/api/helpers';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';

export const useGetExpeditionList = createPaginationQueryHook<
  typeof Expedition,
  SortableQueryParams
>({
  endpoint: '/expeditions',
  dataSchema: Expedition,
  rQueryParams: { queryKey: ['expeditions'] },
});

export const useGetExpedition = createGetQueryHook({
  endpoint: '/expeditions/:id',
  responseSchema: Expedition,
  rQueryParams: { queryKey: ['expeditions'] },
});

export const useCreateExpedition = createPostMutationHook({
  endpoint: '/expeditions',
  bodySchema: CreateExpedition,
  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Expedition created successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useAddExpeditionItem = createPostMutationHook({
  endpoint: '/expeditions/:expeditionId/scan',
  bodySchema: AddExpeditionItem,
  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Item added to expedition',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useUpdateExpeditionItem = createPutMutationHook({
  endpoint: '/expeditions/:expeditionId/items/:itemId',
  bodySchema: UpdateExpeditionItemQuantity,
  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Item quantity updated',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useRemoveExpeditionItem = createDeleteMutationHook({
  endpoint: '/expeditions/:expeditionId/items/:itemId',
  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Item removed from expedition',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useConfirmExpeditionItem = createPostMutationHook({
  endpoint: '/expeditions/:expeditionId/items/:itemId/confirm',
  bodySchema: ConfirmExpeditionItem,
  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Item confirmed',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useEndExpedition = createPostMutationHook({
  endpoint: '/expeditions/:expeditionId/end',
  bodySchema: EndExpedition,
  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Expedition ended successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useCancelExpedition = createPostMutationHook({
  endpoint: '/expeditions/:expeditionId/cancel',
  bodySchema: z.object({}),
  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Expedition cancelled',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useGetExpeditionAnalytics = createGetQueryHook({
  endpoint: '/expeditions/analytics/stats',
  responseSchema: ExpeditionAnalytics,
  rQueryParams: { queryKey: ['expeditions'] },
});
