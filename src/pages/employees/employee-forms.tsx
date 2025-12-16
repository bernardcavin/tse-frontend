import { CreateEmployee, UpdateEmployee } from '@/api/entities/auth';
import { useCreateEmployee, useGetEmployees, useUpdateEmployee } from '@/hooks/api/employees';
import { emptyStringToNull } from '@/utilities/object';
import { Button, Group, PasswordInput, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';

interface EmployeeFormProps {
  employeeId?: string;
  onSuccess?: () => void;
}

export function EmployeeForm({ employeeId, onSuccess }: EmployeeFormProps) {
  const isEditing = !!employeeId;

  const { data: employees } = useGetEmployees();
  const employee = employees?.find((emp) => emp.id === employeeId);

  const { mutate: createEmployee, isPending: isCreating } = useCreateEmployee();
  const { mutate: updateEmployee, isPending: isUpdating } = useUpdateEmployee();

  const form = useForm({
    initialValues: {
      name: '',
      username: '',
      employee_num: '',
      email: '',
      nik: '',
      position: '',
      department: '',
      phone_number: '',
      hire_date: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      password: '',
      role: 'EMPLOYEE' as 'EMPLOYEE' | 'MANAGER',
    },
    validate: zodResolver(isEditing ? UpdateEmployee : CreateEmployee),
  });

  useEffect(() => {
    if (employee && isEditing) {
      form.setValues({
        name: employee.name,
        username: employee.username,
        employee_num: employee.employee_num || '',
        email: employee.email || '',
        nik: employee.nik || '',
        position: employee.position || '',
        department: employee.department || '',
        phone_number: employee.phone_number || '',
        hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
        address: employee.address || '',
        emergency_contact_name: employee.emergency_contact_name || '',
        emergency_contact_phone: employee.emergency_contact_phone || '',
        password: '', // Don't pre-fill password for security
        role: employee.role as 'EMPLOYEE' | 'MANAGER',
      });
    }
  }, [employee, isEditing]);

  const handleSubmit = (values: typeof form.values) => {
    if (isEditing && employeeId) {
      // When editing, send all non-password fields (allows clearing fields with empty strings)
      const updateData: any = {
        name: values.name,
        username: values.username,
        employee_num: values.employee_num,
        email: values.email,
        nik: values.nik,
        position: values.position,
        department: values.department,
        phone_number: values.phone_number,
        hire_date: values.hire_date,
        address: values.address,
        emergency_contact_name: values.emergency_contact_name,
        emergency_contact_phone: values.emergency_contact_phone,
        role: values.role,
      };
      // Only include password if it's been changed
      if (values.password) {
        updateData.password = values.password;
      }

      updateEmployee(
        { id: employeeId, data: emptyStringToNull(updateData) },
        {
          onSuccess: () => {
            modals.close('employee-edit');
            onSuccess?.();
          },
        }
      );
    } else {
      createEmployee(values, {
        onSuccess: () => {
          modals.close('employee-create');
          onSuccess?.();
        },
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Name"
          placeholder="Enter employee name"
          required={!isEditing}
          {...form.getInputProps('name')}
        />

        <TextInput
          label="Username"
          placeholder="Enter username"
          required={!isEditing}
          {...form.getInputProps('username')}
        />

        <TextInput
          label="Employee Number"
          placeholder="Enter employee number"
          {...form.getInputProps('employee_num')}
        />

        <TextInput
          label="Email"
          placeholder="Enter email address"
          type="email"
          {...form.getInputProps('email')}
        />

        <TextInput
          label="NIK (National ID)"
          placeholder="Enter NIK"
          {...form.getInputProps('nik')}
        />

        <TextInput
          label="Position"
          placeholder="Enter job position/title"
          {...form.getInputProps('position')}
        />

        <TextInput
          label="Department"
          placeholder="Enter department"
          {...form.getInputProps('department')}
        />

        <TextInput
          label="Phone Number"
          placeholder="Enter phone number"
          type="tel"
          {...form.getInputProps('phone_number')}
        />

        <TextInput
          label="Hire Date"
          placeholder="Select hire date"
          type="date"
          {...form.getInputProps('hire_date')}
        />

        <Textarea
          label="Address"
          placeholder="Enter address"
          minRows={2}
          {...form.getInputProps('address')}
        />

        <TextInput
          label="Emergency Contact Name"
          placeholder="Enter emergency contact name"
          {...form.getInputProps('emergency_contact_name')}
        />

        <TextInput
          label="Emergency Contact Phone"
          placeholder="Enter emergency contact phone"
          type="tel"
          {...form.getInputProps('emergency_contact_phone')}
        />

        <PasswordInput
          label="Password"
          placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
          required={!isEditing}
          {...form.getInputProps('password')}
        />

        <Select
          label="Role"
          placeholder="Select role"
          required
          data={[
            { value: 'EMPLOYEE', label: 'Employee' },
            { value: 'MANAGER', label: 'Manager' },
          ]}
          {...form.getInputProps('role')}
        />

        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            onClick={() => modals.close(isEditing ? 'employee-edit' : 'employee-create')}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isCreating || isUpdating}>
            {isEditing ? 'Update' : 'Create'} Employee
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
