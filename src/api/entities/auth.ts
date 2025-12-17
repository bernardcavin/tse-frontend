import { z } from 'zod';

export const User = z.object({
  id: z.string().uuid(),
  name: z.string(),
  username: z.string(),
  employee_num: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  nik: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  hire_date: z.coerce.date().optional().nullable(),
  address: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  role: z.string(),
});

export const CreateEmployee = z.object({
  username: z.string(),
  name: z.string(),
  employee_num: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  nik: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  hire_date: z.coerce.date().optional().nullable(),
  address: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  password: z.string(),
  role: z.string().default('EMPLOYEE'),
});

export const UpdateEmployee = z.object({
  username: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  employee_num: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  nik: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  hire_date: z.coerce.date().optional().nullable(),
  address: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
});
