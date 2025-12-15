import { z } from 'zod';
import { dateSchema } from '@/utilities/date';

export const LoginRequestSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const LoginResponseSchema = z.object({
  token_type: z.literal('bearer'),
  access_token: z.string(),
});
