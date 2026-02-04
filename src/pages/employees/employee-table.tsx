import { useCallback, useMemo } from 'react';
import { DataTableColumn } from 'mantine-datatable';
import { useNavigate } from 'react-router-dom';
import z from 'zod';
import { Badge, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { User } from '@/api/entities/auth';
import { usePagination } from '@/api/helpers';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import { useAuth } from '@/hooks';
import { useDeleteEmployee, useGetEmployeeList } from '@/hooks/api/employees';
import { paths } from '@/routes';
import { icons } from '@/utilities/icons';
import { openEmployeeCreate, openEmployeeEdit } from './employee-modals';

type EmployeeType = z.infer<typeof User>;

type SortableFields = Pick<EmployeeType, 'name' | 'username'>;

export function EmployeeTable() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { page, limit, setLimit, setPage } = usePagination();

  // Check if user can modify employees (only managers can edit/delete)
  const canModifyEmployees = currentUser?.role === 'MANAGER';
  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'asc',
      column: 'name',
    },
  });

  const {
    data: employees,
    isLoading,
    refetch,
  } = useGetEmployeeList({
    query: {
      page,
      limit,
      sort: sort.query,
    },
  });

  const { mutate: deleteEmployee } = useDeleteEmployee();
  const handleDelete = useCallback(
    (id: string) => {
      modals.openConfirmModal({
        title: 'Delete Employee',
        children: 'Are you sure you want to delete this employee?',
        confirmProps: { color: 'red' },
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        onConfirm: () => {
          deleteEmployee({ route: { id } });
          refetch();
        },
      });
    },
    [deleteEmployee, refetch]
  );

  const columns: DataTableColumn<EmployeeType>[] = useMemo(
    () => [
      {
        accessor: 'name',
        title: 'Name',
        sortable: true,
      },
      {
        accessor: 'username',
        title: 'Username',
        sortable: true,
      },
      {
        accessor: 'employee_num',
        title: 'Employee #',
        render: ({ employee_num }) => employee_num || <Text c="dimmed">-</Text>,
      },
      {
        accessor: 'email',
        title: 'Email',
        render: ({ email }) => email || <Text c="dimmed">-</Text>,
      },
      {
        accessor: 'nik',
        title: 'NIK',
        render: ({ nik }) => nik || <Text c="dimmed">-</Text>,
      },
      {
        accessor: 'position',
        title: 'Position',
        render: ({ position }) => position || <Text c="dimmed">-</Text>,
      },
      {
        accessor: 'department',
        title: 'Department',
        render: ({ department }) => department || <Text c="dimmed">-</Text>,
      },
      {
        accessor: 'phone_number',
        title: 'Phone',
        render: ({ phone_number }) => phone_number || <Text c="dimmed">-</Text>,
      },
      {
        accessor: 'role',
        title: 'Role',
        sortable: true,
        render: ({ role }) => <Badge color={role === 'MANAGER' ? 'blue' : 'gray'}>{role}</Badge>,
      },
      {
        accessor: 'id',
        title: 'User ID',
        render: ({ id }) => <Text size="xs">{id.slice(0, 8)}...</Text>,
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        width: 130,
        render: (row: any) => (
          <DataTable.Actions
            onView={() => navigate(paths.manager.employeeDetail(row.id))}
            onEdit={canModifyEmployees ? () => openEmployeeEdit(row.id, refetch) : undefined}
            onDelete={
              canModifyEmployees && row.id !== currentUser?.id
                ? () => handleDelete(row.id)
                : undefined // HR/Finance cannot delete, and prevent deleting yourself
            }
          />
        ),
      },
    ],
    [currentUser?.id, handleDelete, navigate]
  );

  const Icon = icons.users;

  return (
    <DataTable.Container>
      <DataTable.Title
        icon={<Icon size={25} />}
        title="Employees"
        actions={
          canModifyEmployees ? (
            <AddButton variant="default" size="xs" onClick={() => openEmployeeCreate(refetch)}>
              Add Employee
            </AddButton>
          ) : undefined
        }
      />
      <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
      <DataTable.Content>
        <DataTable.Table
          striped
          minHeight={240}
          noRecordsText={DataTable.noRecordsText('employees')}
          recordsPerPageLabel={DataTable.recordsPerPageLabel('employees')}
          paginationText={DataTable.paginationText('employees')}
          page={page}
          records={employees?.data ?? []}
          fetching={isLoading}
          onPageChange={setPage}
          recordsPerPage={limit}
          totalRecords={employees?.meta.total ?? 0}
          onRecordsPerPageChange={setLimit}
          recordsPerPageOptions={[5, 15, 30]}
          sortStatus={sort.status}
          onSortStatusChange={sort.change}
          columns={columns}
          pinLastColumn
          highlightOnHover
        />
      </DataTable.Content>
    </DataTable.Container>
  );
}
