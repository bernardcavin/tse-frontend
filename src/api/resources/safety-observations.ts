import { BackendResponse } from '@/api/entities';
import {
  SafetyObservation,
  SafetyObservationClose,
  SafetyObservationCreate,
  SafetyObservationResolve,
  SafetyObservationUpdate,
} from '@/api/entities/safety-observations';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client } from '../axios';

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function createSafetyObservation(
  data: ReturnType<typeof SafetyObservationCreate.parse>
) {
  const response = await client.post('safety-observations', data);
  return SafetyObservation.parse(BackendResponse.parse(response.data).data);
}

export async function updateSafetyObservation(
  id: string,
  data: ReturnType<typeof SafetyObservationUpdate.parse>
) {
  const response = await client.put(`safety-observations/${id}`, data);
  return SafetyObservation.parse(BackendResponse.parse(response.data).data);
}

export async function deleteSafetyObservation(id: string) {
  const response = await client.delete(`safety-observations/${id}`);
  return BackendResponse.parse(response.data);
}

export async function getSafetyObservation(id: string) {
  const response = await client.get(`safety-observations/${id}`);
  return SafetyObservation.parse(BackendResponse.parse(response.data).data);
}

export async function resolveSafetyObservation(
  id: string,
  data: ReturnType<typeof SafetyObservationResolve.parse>
) {
  const response = await client.put(`safety-observations/${id}/resolve`, data);
  return SafetyObservation.parse(BackendResponse.parse(response.data).data);
}

export async function closeSafetyObservation(
  id: string,
  data: ReturnType<typeof SafetyObservationClose.parse>
) {
  const response = await client.put(`safety-observations/${id}/close`, data);
  return SafetyObservation.parse(BackendResponse.parse(response.data).data);
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export function useSafetyObservations() {
  return useQuery({
    queryKey: ['safety-observations'],
    queryFn: async () => {
      const response = await client.get('safety-observations');
      return BackendResponse.parse(response.data).data;
    },
  });
}

export function useSafetyObservation(id: string | null) {
  return useQuery({
    queryKey: ['safety-observation', id],
    queryFn: () => getSafetyObservation(id!),
    enabled: !!id,
  });
}

export function useCreateSafetyObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSafetyObservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-observations'] });
    },
  });
}

export function useUpdateSafetyObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnType<typeof SafetyObservationUpdate.parse> }) =>
      updateSafetyObservation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-observations'] });
      queryClient.invalidateQueries({ queryKey: ['safety-observation'] });
    },
  });
}

export function useDeleteSafetyObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSafetyObservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-observations'] });
    },
  });
}

export function useResolveSafetyObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ReturnType<typeof SafetyObservationResolve.parse> }) => {
      return resolveSafetyObservation(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-observations'] });
      queryClient.invalidateQueries({ queryKey: ['safety-observation'] });
      queryClient.invalidateQueries({ queryKey: ['safety-analytics'] });
    },
  });
}

export function useCloseSafetyObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ReturnType<typeof SafetyObservationClose.parse> }) => {
      return closeSafetyObservation(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-observations'] });
      queryClient.invalidateQueries({ queryKey: ['safety-observation'] });
      queryClient.invalidateQueries({ queryKey: ['safety-analytics'] });
    },
  });
}

// Analytics hook
export function useSafetyAnalytics() {
  return useQuery({
    queryKey: ['safety-analytics'],
    queryFn: async () => {
      const response = await client.get('safety-observations/analytics/summary');
      return BackendResponse.parse(response.data).data;
    },
  });
}
