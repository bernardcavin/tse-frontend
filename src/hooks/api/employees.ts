import { CreateEmployee, UpdateEmployee } from '@/api/entities/auth';
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  updateEmployee,
} from '@/api/resources/auth';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useGetEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: getAllEmployees,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ReturnType<typeof CreateEmployee.parse>) => createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      notifications.show({
        title: 'Success',
        message: 'Employee created successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to create employee',
        color: 'red',
      });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnType<typeof UpdateEmployee.parse> }) =>
      updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      notifications.show({
        title: 'Success',
        message: 'Employee updated successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update employee',
        color: 'red',
      });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ route }: { route: { id: string } }) => deleteEmployee(route.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      notifications.show({
        title: 'Success',
        message: 'Employee deleted successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete employee',
        color: 'red',
      });
    },
  });
}
