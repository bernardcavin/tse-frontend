import { Task } from '@/api/entities/tasks';
import { usePagination } from '@/api/helpers';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import { useAuth } from '@/hooks';
import { useDeleteTask, useGetTasks } from '@/hooks/api/tasks';
import { formatDateReadable } from '@/utilities/date';
import { Badge } from '@mantine/core';
import { modals } from '@mantine/modals';
import { DataTableColumn } from 'mantine-datatable';
import { useCallback, useMemo } from 'react';
import { openTaskCreate, openTaskEdit } from './tasks-modals';

export function TasksTable() {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';
  
  const { page, limit, setLimit, setPage } = usePagination();
  const { filters, sort } = DataTable.useDataTable({
    sortConfig: { direction: 'desc', column: 'created_at' },
  });

  const { data, isLoading, refetch } = useGetTasks({
    query: { page, limit, sort: sort.query },
  });

  const { mutate: deleteTask } = useDeleteTask();

  const handleDelete = useCallback(
    (id: string) => {
      modals.openConfirmModal({
        title: 'Delete Task',
        children: 'Are you sure you want to delete this task?',
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        onConfirm: () => {
          deleteTask(
            { route: { id } },
            { onSuccess: () => refetch() }
          );
        },
      });
    },
    [deleteTask, refetch]
  );

  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'blue';
      case 'IN_PROGRESS': return 'yellow';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'gray';
      case 'ON_HOLD': return 'orange';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
     switch (priority) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'blue';
      case 'LOW': return 'gray';
      default: return 'gray';
    }
  };

  const columns: DataTableColumn<Task>[] = useMemo(
    () => [
      { accessor: 'title', title: 'Task', sortable: true },
      { 
        accessor: 'status', 
        title: 'Status', 
        sortable: true,
        render: ({ status }) => (
            <Badge color={getStatusColor(status)}>{status}</Badge>
        )
      },
      { 
        accessor: 'priority', 
        title: 'Priority', 
        sortable: true,
        render: ({ priority }) => (
            <Badge variant="outline" color={getPriorityColor(priority)}>{priority}</Badge>
        )
      },
      { 
        accessor: 'start_date', 
        title: 'Start Date', 
        sortable: true,
        render: ({ start_date }) => start_date ? formatDateReadable(new Date(start_date)) : '-'
      },
      { 
        accessor: 'end_date', 
        title: 'End Date', 
        sortable: true,
        render: ({ end_date }) => end_date ? formatDateReadable(new Date(end_date)) : '-'
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        render: (row) => (
          <DataTable.Actions
            onEdit={() => openTaskEdit(row.id, refetch)}
            onDelete={isManager ? () => handleDelete(row.id) : undefined}
          />
        ),
      },
    ],
    [isManager, handleDelete]
  );

  return (
    <DataTable.Container>
        <DataTable.Title
            title="Tasks"
            actions={
                <AddButton onClick={() => openTaskCreate(refetch)}variant='default'>
                    Add Task
                </AddButton>
            }
        />
        <DataTable.Content>
            <DataTable.Table
          striped
          minHeight={240}
          noRecordsText={DataTable.noRecordsText('safety observations')}
          recordsPerPageLabel={DataTable.recordsPerPageLabel('safety observations')}
          paginationText={DataTable.paginationText('safety observations')}
          page={page}
          records={data?.data ?? []}
          fetching={isLoading}
          onPageChange={setPage}
          recordsPerPage={limit}
          totalRecords={data?.meta?.total ?? 0}
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
