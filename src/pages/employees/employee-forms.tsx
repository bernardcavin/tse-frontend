import { CreateEmployee, UpdateEmployee } from '@/api/entities/auth';
import { FormSection } from '@/components/form-section';
import { useCreateEmployee, useGetEmployees, useUpdateEmployee } from '@/hooks/api/employees';
import { emptyStringToNull } from '@/utilities/object';
import { Button, Grid, Group, PasswordInput, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';
import z from 'zod';

const DEPARTMENT_OPTIONS = [
  { value: 'HSE', label: 'HSE' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Operation', label: 'Operation' },
  { value: 'IT', label: 'IT' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Procurement', label: 'Procurement' },
  { value: 'HR', label: 'HR' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'QA/QC', label: 'QA/QC' },
  { value: 'Safety', label: 'Safety' },
  { value: 'Other', label: 'Other' },
];

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

  const form = useForm<z.infer<typeof CreateEmployee>>({
    validate: zodResolver(isEditing ? UpdateEmployee : CreateEmployee),
  });

  useEffect(() => {
    if (employee && isEditing) {
      form.setValues({
        name: employee.name,
        username: employee.username,
        employee_num: employee.employee_num,
        email: employee.email,
        nik: employee.nik,
        position: employee.position,
        department: employee.department,
        phone_number: employee.phone_number,
        hire_date: employee.hire_date ? new Date(employee.hire_date) : null,
        address: employee.address,
        emergency_contact_name: employee.emergency_contact_name,
        emergency_contact_phone: employee.emergency_contact_phone,
        password: '', // Don't pre-fill password for security
        role: employee.role as 'EMPLOYEE' | 'MANAGER',
      });
    }
  }, [employee, isEditing]);

  const handleSubmit = form.onSubmit((values: any) => {

    if (isEditing && employeeId) {

      updateEmployee(
        { id: employeeId, data: emptyStringToNull(values) },
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
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* Basic Information */}
        <FormSection title="Basic Information">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Full Name"
                placeholder="e.g. John Doe"
                description="Employee's full name"
                required={!isEditing}
                {...form.getInputProps('name')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Username"
                placeholder="e.g. johndoe"
                description="Used for login"
                required={!isEditing}
                {...form.getInputProps('username')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Employee Number"
                placeholder="e.g. EMP-001"
                description="Unique employee identifier"
                {...form.getInputProps('employee_num')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="NIK (National ID)"
                placeholder="e.g. 1234567890123456"
                description="Indonesian National ID number"
                {...form.getInputProps('nik')}
              />
            </Grid.Col>
          </Grid>
        </FormSection>

        {/* Contact Information */}
        <FormSection title="Contact Information">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Email Address"
                placeholder="e.g. john.doe@company.com"
                type="email"
                description="Work email address"
                {...form.getInputProps('email')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Phone Number"
                placeholder="e.g. +62 812-3456-7890"
                type="tel"
                description="Mobile or work phone"
                {...form.getInputProps('phone_number')}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="Address"
                placeholder="Enter full address"
                description="Residential address"
                minRows={2}
                {...form.getInputProps('address')}
              />
            </Grid.Col>
          </Grid>
        </FormSection>

        {/* Employment Information */}
        <FormSection title="Employment Information">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Position / Job Title"
                placeholder="e.g. Senior Engineer, Manager"
                description="Current job position"
                {...form.getInputProps('position')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Department"
                placeholder="Select department"
                description="Employee's department"
                data={DEPARTMENT_OPTIONS}
                searchable
                clearable
                {...form.getInputProps('department')}
                comboboxProps={{ zIndex: 2001 }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DatePickerInput
                label="Hire Date"
                placeholder="Select hire date"
                description="Date employee was hired"
                valueFormat="DD/MM/YYYY"
                clearable
                {...form.getInputProps('hire_date')}
                popoverProps={{ zIndex: 2001 }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Role"
                placeholder="Select role"
                description="System access level"
                required
                data={[
                  { value: 'EMPLOYEE', label: 'Employee' },
                  { value: 'MANAGER', label: 'Manager' },
                ]}
                {...form.getInputProps('role')}
                comboboxProps={{ zIndex: 2001 }}
              />
            </Grid.Col>
          </Grid>
        </FormSection>

        {/* Emergency Contact */}
        <FormSection title="Emergency Contact">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Emergency Contact Name"
                placeholder="e.g. Jane Doe (Spouse)"
                description="Name of person to contact in emergency"
                {...form.getInputProps('emergency_contact_name')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Emergency Contact Phone"
                placeholder="e.g. +62 812-9876-5432"
                type="tel"
                description="Emergency contact's phone number"
                {...form.getInputProps('emergency_contact_phone')}
              />
            </Grid.Col>
          </Grid>
        </FormSection>

        {/* Credentials */}
        <FormSection title="Credentials">
          <Grid>
            <Grid.Col span={12}>
              <PasswordInput
                label="Password"
                placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
                description={
                  isEditing
                    ? 'Only enter if you want to change the password'
                    : 'Password for login access'
                }
                required={!isEditing}
                {...form.getInputProps('password')}
              />
            </Grid.Col>
          </Grid>
        </FormSection>

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
