import { modals } from '@mantine/modals';
import { EmployeeForm } from './employee-forms';

export function openEmployeeCreate(onSuccess?: () => void) {
  modals.open({
    modalId: 'employee-create',
    title: 'Create Employee',
    size: 'lg',
    children: <EmployeeForm onSuccess={onSuccess} />,
  });
}

export function openEmployeeEdit(id: string, onSuccess?: () => void) {
  modals.open({
    modalId: 'employee-edit',
    title: 'Edit Employee',
    size: 'lg',
    children: <EmployeeForm employeeId={id} onSuccess={onSuccess} />,
  });
}
