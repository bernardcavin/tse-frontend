import { BackendResponse } from '@/api/entities';
import {
  HazardObservation,
  HazardObservationCreate,
  HazardObservationResolve,
  HazardObservationUpdate,
} from '@/api/entities/hazard-observations';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client } from '../axios';

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function createHazardObservation(
  data: ReturnType<typeof HazardObservationCreate.parse>
) {
  const response = await client.post('hazard-observations', data);
  return HazardObservation.parse(BackendResponse.parse(response.data).data);
}

export async function updateHazardObservation(
  id: string,
  data: ReturnType<typeof HazardObservationUpdate.parse>
) {
  const response = await client.put(`hazard-observations/${id}`, data);
  return HazardObservation.parse(BackendResponse.parse(response.data).data);
}

export async function deleteHazardObservation(id: string) {
  const response = await client.delete(`hazard-observations/${id}`);
  return BackendResponse.parse(response.data);
}

export async function getHazardObservation(id: string) {
  const response = await client.get(`hazard-observations/${id}`);
  return HazardObservation.parse(BackendResponse.parse(response.data).data);
}

export async function resolveHazardObservation(
  id: string,
  data: ReturnType<typeof HazardObservationResolve.parse>
) {
  const response = await client.put(`hazard-observations/${id}/resolve`, data);
  return HazardObservation.parse(BackendResponse.parse(response.data).data);
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export function useHazardObservations() {
  return useQuery({
    queryKey: ['hazard-observations'],
    queryFn: async () => {
      const response = await client.get('hazard-observations');
      return BackendResponse.parse(response.data).data;
    },
  });
}

export function useHazardObservation(id: string | null) {
  return useQuery({
    queryKey: ['hazard-observation', id],
    queryFn: () => getHazardObservation(id!),
    enabled: !!id,
  });
}

export function useCreateHazardObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHazardObservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hazard-observations'] });
    },
  });
}

export function useUpdateHazardObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnType<typeof HazardObservationUpdate.parse> }) =>
      updateHazardObservation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hazard-observations'] });
      queryClient.invalidateQueries({ queryKey: ['hazard-observation'] });
    },
  });
}

export function useDeleteHazardObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHazardObservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hazard-observations'] });
    },
  });
}

export function useResolveHazardObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ReturnType<typeof HazardObservationResolve.parse> }) => {
      return resolveHazardObservation(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hazard-observations'] });
      queryClient.invalidateQueries({ queryKey: ['hazard-observation'] });
      queryClient.invalidateQueries({ queryKey: ['hazard-analytics'] });
    },
  });
}

// Analytics hook
export function useHazardAnalytics() {
  return useQuery({
    queryKey: ['hazard-analytics'],
    queryFn: async () => {
      const response = await client.get('hazard-observations/analytics/summary');
      return BackendResponse.parse(response.data).data;
    },
  });
}
