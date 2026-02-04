import z from 'zod';
import { notifications } from '@mantine/notifications';
import {
  SafetyObservation,
  SafetyObservationClose,
  SafetyObservationCreate,
  SafetyObservationResolve,
  SafetyObservationUpdate,
} from '@/api/entities/safety-observations';
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

export const useGetSafetyObservationList = createPaginationQueryHook<
  typeof SafetyObservation,
  SortableQueryParams
>({
  endpoint: '/safety-observations',
  dataSchema: SafetyObservation,
  rQueryParams: {
    queryKey: ['safety-observations'],
  },
});

export const useGetSafetyObservation = createGetQueryHook({
  endpoint: '/safety-observations/:id',
  responseSchema: SafetyObservation,
  rQueryParams: {
    queryKey: ['safety-observation'],
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

export const useCreateSafetyObservation = createPostMutationHook({
  endpoint: '/safety-observations',
  bodySchema: SafetyObservationCreate,

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Berhasil',
        message: 'Safety observation berhasil dibuat',
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

export const useEditSafetyObservation = createPutMutationHook({
  endpoint: '/safety-observations/:id',
  bodySchema: SafetyObservationUpdate,

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Berhasil',
        message: 'Safety observation berhasil diperbarui',
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

export const useDeleteSafetyObservation = createDeleteMutationHook({
  endpoint: '/safety-observations/:id',

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Berhasil',
        message: 'Safety observation berhasil dihapus',
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
// DOMAIN-SPECIFIC ACTIONS
// ============================================================================

export const useResolveSafetyObservation = createPutMutationHook({
  endpoint: '/safety-observations/:id/resolve',
  bodySchema: SafetyObservationResolve,

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Berhasil',
        message: 'Safety observation berhasil di-resolve',
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

export const useCloseSafetyObservation = createPutMutationHook({
  endpoint: '/safety-observations/:id/close',
  bodySchema: SafetyObservationClose,

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Berhasil',
        message: 'Safety observation berhasil ditutup',
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

export const useSafetyAnalytics = createGetQueryHook({
  endpoint: '/safety-observations/analytics/summary',
  responseSchema: z.any(),
  rQueryParams: {
    queryKey: ['safety-analytics'],
  },
});
