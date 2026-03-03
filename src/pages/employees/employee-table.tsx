import { User } from '@/api/entities/auth';
import { usePagination } from '@/api/helpers';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import { useAuth } from '@/hooks';
import { useClearEmployeeFace, useDeleteEmployee, useGetEmployeeList } from '@/hooks/api/employees';
import { paths } from '@/routes';
import { icons } from '@/utilities/icons';
import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { DataTableColumn } from 'mantine-datatable';
import { useCallback, useMemo } from 'react';
import { PiScanDuotone } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import z from 'zod';
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

  const { mutate: clearEmployeeFace } = useClearEmployeeFace();
  const handleClearFace = useCallback(
    (id: string) => {
      modals.openConfirmModal({
        title: 'Clear Face Enrollment',
        children: 'Are you sure you want to clear this employee\'s face enrollment? They will need to re-enroll their face to check in.',
        confirmProps: { color: 'red' },
        labels: { confirm: 'Clear Face', cancel: 'Cancel' },
        onConfirm: () => {
          clearEmployeeFace(id);
          refetch();
        },
      });
    },
    [clearEmployeeFace, refetch]
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
        accessor: 'role',
        title: 'Role',
        sortable: true,
        render: ({ role }) => <Badge color={role === 'MANAGER' ? 'blue' : 'gray'}>{role}</Badge>,
      },
      {
        accessor: 'has_face_embedding',
        title: 'Face Enrolled',
        render: ({ has_face_embedding }) => (
          <Badge color={has_face_embedding ? 'green' : 'gray'} variant="light">
            {has_face_embedding ? 'Yes' : 'No'}
          </Badge>
        ),
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        width: 160,
        render: (row: any) => (
          <Group gap="xs" justify="flex-end" wrap="nowrap">
            <DataTable.Actions
              onView={() => navigate(paths.manager.employeeDetail(row.id))}
              onEdit={canModifyEmployees ? () => openEmployeeEdit(row.id, refetch) : undefined}
              onDelete={
                canModifyEmployees && row.id !== currentUser?.id
                  ? () => handleDelete(row.id)
                  : undefined
              }
            />
            {canModifyEmployees && row.has_face_embedding && (
              <Tooltip label="Clear Face">
                        <ActionIcon
                          variant="default"
                          c="orange"
                          onClick={(e) => {
                  e.stopPropagation();
                  handleClearFace(row.id);
                }}
                        >
                          <PiScanDuotone size="1rem" />
                        </ActionIcon>
                      </Tooltip>
            )}
          </Group>
        ),
      },
    ],
    [currentUser?.id, handleDelete, handleClearFace, navigate, canModifyEmployees, refetch]
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
