import z from 'zod';
import { notifications } from '@mantine/notifications';
import {
  ITTicket,
  ITTicketAssign,
  ITTicketCreate,
  ITTicketResolve,
  ITTicketUpdate,
} from '@/api/entities/it-tickets';
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

export const useGetITTicketList = createPaginationQueryHook<typeof ITTicket, SortableQueryParams>({
  endpoint: '/it-tickets',
  dataSchema: ITTicket,
  rQueryParams: {
    queryKey: ['it-tickets'],
  },
});

export const useGetITTicket = createGetQueryHook({
  endpoint: '/it-tickets/:id',
  responseSchema: ITTicket,
  rQueryParams: {
    queryKey: ['it-ticket'],
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

export const useCreateITTicket = createPostMutationHook({
  endpoint: '/it-tickets',
  bodySchema: ITTicketCreate,

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Berhasil',
        message: 'IT Ticket berhasil dibuat',
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

export const useEditITTicket = createPutMutationHook({
  endpoint: '/it-tickets/:id',
  bodySchema: ITTicketUpdate,

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Berhasil',
        message: 'IT Ticket berhasil diperbarui',
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

export const useDeleteITTicket = createDeleteMutationHook({
  endpoint: '/it-tickets/:id',

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Berhasil',
        message: 'IT Ticket berhasil dihapus',
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

export const useAssignITTicket = createPutMutationHook({
  endpoint: '/it-tickets/:id/assign',
  bodySchema: ITTicketAssign,

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Berhasil',
        message: 'IT Ticket berhasil di-assign',
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

export const useResolveITTicket = createPutMutationHook({
  endpoint: '/it-tickets/:id/resolve',
  bodySchema: ITTicketResolve,

  rMutationParams: {
    onSuccess: () => {
      notifications.show({
        title: 'Berhasil',
        message: 'IT Ticket berhasil di-resolve',
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

export const useITTicketAnalytics = createGetQueryHook({
  endpoint: '/it-tickets/analytics/summary',
  responseSchema: z.any(),
  rQueryParams: {
    queryKey: ['it-ticket-analytics'],
  },
});
