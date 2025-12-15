import { z } from 'zod';

export const BackendResponse = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
});

export const OptionResponse = z.object({
  label: z.string(),
  value: z.string(),
});
