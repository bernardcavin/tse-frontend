import { BackendResponse } from '@/api/entities';
import { app } from '@/config';
import { client } from '../axios';
import { User } from '../entities/auth';

type CacheEntry<T> = {
  value: T;
  expiry: number;
};

const userCache = new Map<string, CacheEntry<ReturnType<typeof User.parse>>>();

export async function getAccountInfo(ttlMs = 5 * 60 * 1000) {
  const token = localStorage.getItem(app.accessTokenStoreKey);
  if (!token) {
    throw new Error('No access token found');
  }
  const cached = userCache.get('me');
  const now = Date.now();
  if (cached && cached.expiry > now) {
    return cached.value;
  }
  const response = await client.get('auth/me');
  const parsed = User.parse(BackendResponse.parse(response.data).data);
  userCache.set('me', { value: parsed, expiry: Date.now() + ttlMs });
  return parsed;
}
