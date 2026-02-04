import z from 'zod';
import { notifications } from '@mantine/notifications';
import { Housekeeping, HousekeepingCreate, HousekeepingUpdate } from '@/api/entities/housekeeping';
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

export const useGetHousekeepingList = createPaginationQueryHook<
  typeof Housekeeping,
  SortableQueryParams
>({
  endpoint: '/housekeeping',
  dataSchema: Housekeeping,
  rQueryParams: {
    queryKey: ['housekeeping'],
  },
});

export const useGetHousekeeping = createGetQueryHook({
  endpoint: '/housekeeping/:id',
  responseSchema: Housekeeping,
  rQueryParams: {
    queryKey: ['housekeeping'],
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

export const useCreateHousekeeping = createPostMutationHook({
  endpoint: '/housekeeping',
  bodySchema: HousekeepingCreate,

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Berhasil',
        message: 'Housekeeping berhasil dibuat',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        message: error.message,
        color: 'red',
      });
    },
  },
});

export const useEditHousekeeping = createPutMutationHook({
  endpoint: '/housekeeping/:id',
  bodySchema: HousekeepingUpdate,

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Berhasil',
        message: 'Housekeeping berhasil diperbarui',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        message: error.message,
        color: 'red',
      });
    },
  },
});

export const useDeleteHousekeeping = createDeleteMutationHook({
  endpoint: '/housekeeping/:id',

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Berhasil',
        message: 'Housekeeping berhasil dihapus',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        message: error.message,
        color: 'red',
      });
    },
  },
});

// ============================================================================
// ANALYTICS
// ============================================================================

export const useHousekeepingAnalytics = createGetQueryHook({
  endpoint: '/housekeeping/analytics/summary',
  responseSchema: z.any(),
  rQueryParams: {
    queryKey: ['housekeeping-analytics'],
  },
});
