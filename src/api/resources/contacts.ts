import { BackendResponse, OptionResponse } from '@/api/entities';
import { client } from '../axios';

export async function getContactOptions() {
  const response = await client.get('contacts/utils/options');
  return OptionResponse.array().parse(BackendResponse.parse(response.data).data);
}

export async function getZoneOptions() {
  const response = await client.get('contacts/utils/zones');
  return OptionResponse.array().parse(BackendResponse.parse(response.data).data);
}
