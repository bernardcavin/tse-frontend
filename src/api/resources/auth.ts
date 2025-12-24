import { BackendResponse } from '@/api/entities';
import { app } from '@/config';
import { client } from '../axios';
import { CreateEmployee, UpdateEmployee, UpdateProfile, User } from '../entities/auth';


export async function getAccountInfo() {
  const token = localStorage.getItem(app.accessTokenStoreKey);
  if (!token) {
    throw new Error('No access token found');
  }

  const response = await client.get('auth/me');
  const parsed = User.parse(BackendResponse.parse(response.data).data);

  return parsed;
}

// Employee Management APIs
export async function getAllEmployees() {
  const response = await client.get('auth/employees');
  const data = BackendResponse.parse(response.data).data;
  return Array.isArray(data) ? data.map((emp) => User.parse(emp)) : [];
}

export async function createEmployee(employee: ReturnType<typeof CreateEmployee.parse>) {
  const response = await client.post('auth/employees', employee);
  return User.parse(BackendResponse.parse(response.data).data);
}

export async function updateEmployee(
  id: string,
  employee: ReturnType<typeof UpdateEmployee.parse>
) {
  const response = await client.put(`auth/employees/${id}`, employee);
  return User.parse(BackendResponse.parse(response.data).data);
}

export async function deleteEmployee(id: string) {
  const response = await client.delete(`auth/employees/${id}`);
  return BackendResponse.parse(response.data);
}

// Profile Update API
export async function updateProfile(profile: ReturnType<typeof UpdateProfile.parse>) {
  const response = await client.put('auth/profile', profile);
  return User.parse(BackendResponse.parse(response.data).data);
}
