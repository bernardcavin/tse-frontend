import { z } from 'zod';
import { dateSchema } from '@/utilities/date';

export const FacilityTypeEnum = z.enum([
  'office',
  'warehouse',
  'yard',
  'rig_site',
  'plant',
  'other',
]);

export const Facility = z.object({
  id: z.string().uuid().optional().nullable(),
  facility_name: z.string(),
  facility_type: FacilityTypeEnum,
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  owner_company: z.string().optional().nullable(),
  manager_name: z.string().optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  photo_file_ids: z.array(z.string()).optional().nullable(),
});

export const FacilityCoordinates = z.object({
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});
