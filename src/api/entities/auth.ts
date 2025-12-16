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
  hire_date: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  role: z.string(),
});

export const CreateEmployee = z.object({
  username: z.string(),
  name: z.string(),
  employee_num: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  nik: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  phone_number: z.string().optional(),
  hire_date: z.string().optional(),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  password: z.string(),
  role: z.string().default('EMPLOYEE'),
});

export const UpdateEmployee = z.object({
  username: z.string().optional(),
  name: z.string().optional(),
  employee_num: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  nik: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  phone_number: z.string().optional(),
  hire_date: z.string().optional(),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  password: z.string().optional(),
  role: z.string().optional(),
});
