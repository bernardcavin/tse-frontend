import { BackendResponse, OptionResponse } from '@/api/entities';
import { FacilityCoordinates } from '@/api/entities/facility';
import { client } from '../axios';

export async function getFacilityOptions() {
  const response = await client.get('facilities/utils/options');
  return OptionResponse.array().parse(BackendResponse.parse(response.data).data);
}

export async function getFacilityCoordinates(facilityId: string) {
  const response = await client.get(`facilities/${facilityId}/coordinates`);
  return FacilityCoordinates.parse(BackendResponse.parse(response.data).data);
}
