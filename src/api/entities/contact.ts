import { z } from 'zod';

export const Contact = z.object({
  id: z.string().uuid().optional().nullable(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  regional: z.coerce.number().optional().nullable(),
  zone: z.string().optional().nullable(),
  field: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ContactType = z.infer<typeof Contact>;

/**
 * Format regional number for display
 * 0 = "-", 1-4 = "Regional 1-4"
 */
export function formatRegional(regional: number | null | undefined): string {
  if (regional === null || regional === undefined || regional === 0) {
    return '-';
  }
  return `Regional ${regional}`;
}
