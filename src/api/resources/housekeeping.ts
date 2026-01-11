import { BackendResponse } from '@/api/entities';
import {
    Housekeeping,
    HousekeepingCreate,
    HousekeepingUpdate,
} from '@/api/entities/housekeeping';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client } from '../axios';

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function createHousekeeping(
  data: ReturnType<typeof HousekeepingCreate.parse>
) {
  const response = await client.post('housekeeping', data);
  return Housekeeping.parse(BackendResponse.parse(response.data).data);
}

export async function updateHousekeeping(
  id: string,
  data: ReturnType<typeof HousekeepingUpdate.parse>
) {
  const response = await client.put(`housekeeping/${id}`, data);
  return Housekeeping.parse(BackendResponse.parse(response.data).data);
}

export async function deleteHousekeeping(id: string) {
  const response = await client.delete(`housekeeping/${id}`);
  return BackendResponse.parse(response.data);
}

export async function getHousekeeping(id: string) {
  const response = await client.get(`housekeeping/${id}`);
  return Housekeeping.parse(BackendResponse.parse(response.data).data);
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export function useHousekeepingList() {
  return useQuery({
    queryKey: ['housekeeping'],
    queryFn: async () => {
      const response = await client.get('housekeeping');
      return BackendResponse.parse(response.data).data;
    },
  });
}

export function useHousekeeping(id: string | null) {
  return useQuery({
    queryKey: ['housekeeping', id],
    queryFn: () => getHousekeeping(id!),
    enabled: !!id,
  });
}

export function useCreateHousekeeping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHousekeeping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping'] });
      queryClient.invalidateQueries({ queryKey: ['housekeeping-analytics'] });
    },
  });
}

export function useUpdateHousekeeping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnType<typeof HousekeepingUpdate.parse> }) =>
      updateHousekeeping(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping'] });
      queryClient.invalidateQueries({ queryKey: ['housekeeping-analytics'] });
    },
  });
}

export function useDeleteHousekeeping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHousekeeping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping'] });
      queryClient.invalidateQueries({ queryKey: ['housekeeping-analytics'] });
    },
  });
}

// Analytics hook
export function useHousekeepingAnalytics() {
  return useQuery({
    queryKey: ['housekeeping-analytics'],
    queryFn: async () => {
      const response = await client.get('housekeeping/analytics/summary');
      return BackendResponse.parse(response.data).data;
    },
  });
}
