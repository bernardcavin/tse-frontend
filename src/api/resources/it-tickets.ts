import { BackendResponse } from '@/api/entities';
import {
    ITTicket,
    ITTicketAssign,
    ITTicketCreate,
    ITTicketResolve,
    ITTicketUpdate,
} from '@/api/entities/it-tickets';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client } from '../axios';

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function createITTicket(
  data: ReturnType<typeof ITTicketCreate.parse>
) {
  const response = await client.post('it-tickets', data);
  return ITTicket.parse(BackendResponse.parse(response.data).data);
}

export async function updateITTicket(
  id: string,
  data: ReturnType<typeof ITTicketUpdate.parse>
) {
  const response = await client.put(`it-tickets/${id}`, data);
  return ITTicket.parse(BackendResponse.parse(response.data).data);
}

export async function deleteITTicket(id: string) {
  const response = await client.delete(`it-tickets/${id}`);
  return BackendResponse.parse(response.data);
}

export async function getITTicket(id: string) {
  const response = await client.get(`it-tickets/${id}`);
  return ITTicket.parse(BackendResponse.parse(response.data).data);
}

export async function assignITTicket(
  id: string,
  data: ReturnType<typeof ITTicketAssign.parse>
) {
  const response = await client.put(`it-tickets/${id}/assign`, data);
  return ITTicket.parse(BackendResponse.parse(response.data).data);
}

export async function resolveITTicket(
  id: string,
  data: ReturnType<typeof ITTicketResolve.parse>
) {
  const response = await client.put(`it-tickets/${id}/resolve`, data);
  return ITTicket.parse(BackendResponse.parse(response.data).data);
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export function useITTickets() {
  return useQuery({
    queryKey: ['it-tickets'],
    queryFn: async () => {
      const response = await client.get('it-tickets');
      return BackendResponse.parse(response.data).data;
    },
  });
}

export function useITTicket(id: string | null) {
  return useQuery({
    queryKey: ['it-ticket', id],
    queryFn: () => getITTicket(id!),
    enabled: !!id,
  });
}

export function useCreateITTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createITTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['it-ticket-analytics'] });
    },
  });
}

export function useUpdateITTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnType<typeof ITTicketUpdate.parse> }) =>
      updateITTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['it-ticket'] });
      queryClient.invalidateQueries({ queryKey: ['it-ticket-analytics'] });
    },
  });
}

export function useDeleteITTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteITTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['it-ticket-analytics'] });
    },
  });
}

export function useAssignITTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ReturnType<typeof ITTicketAssign.parse> }) => {
      return assignITTicket(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['it-ticket'] });
      queryClient.invalidateQueries({ queryKey: ['it-ticket-analytics'] });
    },
  });
}

export function useResolveITTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ReturnType<typeof ITTicketResolve.parse> }) => {
      return resolveITTicket(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['it-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['it-ticket'] });
      queryClient.invalidateQueries({ queryKey: ['it-ticket-analytics'] });
    },
  });
}

// Analytics hook
export function useITTicketAnalytics() {
  return useQuery({
    queryKey: ['it-ticket-analytics'],
    queryFn: async () => {
      const response = await client.get('it-tickets/analytics/summary');
      return BackendResponse.parse(response.data).data;
    },
  });
}
