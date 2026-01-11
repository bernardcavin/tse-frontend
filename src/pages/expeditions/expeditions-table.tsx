import { Expedition, ExpeditionStatus } from '@/api/entities/expeditions';
import { usePagination } from '@/api/helpers';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import { useAuth } from '@/hooks';
import {
  useCancelExpedition,
  useEndExpedition,
  useGetExpeditionList,
} from '@/hooks/api/expeditions';
import { Badge, Button, Group, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconTruckDelivery } from '@tabler/icons-react';
import { DataTableColumn } from 'mantine-datatable';
import { useCallback, useMemo } from 'react';
import z from 'zod';
import { openExpeditionCreate, openExpeditionView } from './expeditions-modals';

type ExpeditionType = z.infer<typeof Expedition>;
type SortableFields = Pick<ExpeditionType, 'started_at' | 'ended_at' | 'status'>;

const STATUS_COLORS: Record<ExpeditionStatus, string> = {
  active: 'blue',
  completed: 'green',
  cancelled: 'red',
};

const STATUS_LABELS: Record<ExpeditionStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function ExpeditionsTable() {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';

  const { page, limit, setLimit, setPage } = usePagination();
  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'desc',
      column: 'started_at',
    },
  });

  const { data, isLoading, refetch } = useGetExpeditionList({
    query: {
      page,
      limit,
      sort: sort.query,
    },
  });

  const { mutate: endExpedition } = useEndExpedition();
  const { mutate: cancelExpedition } = useCancelExpedition();

  const handleEndExpedition = useCallback(
    (id: string) => {
      modals.openConfirmModal({
        title: 'End Expedition',
        children: 'Are you sure you want to end this expedition? All items will be returned to storage.',
        confirmProps: { color: 'blue' },
        labels: { confirm: 'End Expedition', cancel: 'Cancel' },
        onConfirm: () => {
          endExpedition(
            { variables: {}, route: { expeditionId: id }},
            {
              onSuccess: () => refetch(),
            }
          );
        },
      });
    },
    [endExpedition, refetch]
  );

  const handleCancelExpedition = useCallback(
    (id: string) => {
      modals.openConfirmModal({
        title: 'Cancel Expedition',
        children:
          'Are you sure you want to cancel this expedition? This action cannot be undone.',
        confirmProps: { color: 'red' },
        labels: { confirm: 'Cancel Expedition', cancel: 'Back' },
        onConfirm: () => {
          cancelExpedition(
            { variables: {}, route: { expeditionId: id }},
            {
              onSuccess: () => refetch(),
            }
          );
        },
      });
    },
    [cancelExpedition, refetch]
  );

  const formatDuration = (started: string, ended?: string | null) => {
    if (!ended) return 'Ongoing';
    const start = new Date(started);
    const end = new Date(ended);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ${diffHours % 24}h`;
  };

  const columns: DataTableColumn<ExpeditionType>[] = useMemo(
    () => [
      {
        accessor: 'employee',
        title: 'Employee',
        render: ({ employee }) => employee?.name || employee?.username || '-',
      },
      {
        accessor: 'status',
        title: 'Status',
        sortable: true,
        width: 120,
        render: ({ status }) => (
          <Badge color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
        ),
      },
      {
        accessor: 'items',
        title: 'Items',
        textAlign: 'center',
        width: 80,
        render: ({ items }) => <Text>{items?.length || 0}</Text>,
      },
      {
        accessor: 'started_at',
        title: 'Started',
        sortable: true,
        render: ({ started_at }) =>
          started_at ? new Date(started_at).toLocaleString() : '-',
      },
      {
        accessor: 'ended_at',
        title: 'Ended',
        sortable: true,
        render: ({ ended_at }) =>
          ended_at ? new Date(ended_at).toLocaleString() : '-',
      },
      {
        accessor: 'duration',
        title: 'Duration',
        render: ({ started_at, ended_at }) =>
          started_at ? formatDuration(started_at, ended_at) : '-',
      },
      {
        accessor: 'notes',
        title: 'Notes',
        ellipsis: true,
        width: 200,
        render: ({ notes }) => notes || '-',
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        width: 200,
        render: (row: ExpeditionType) => (
          <Group gap="xs" justify="flex-end">
            <DataTable.Actions
              onView={() => openExpeditionView(row.id!)}
              onDelete={null}
              onEdit={null}
            />
            {row.status === 'active' && (
              <>
                <Button size="xs" variant="light" onClick={() => handleEndExpedition(row.id!)}>
                  End
                </Button>
                {isManager && (
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    onClick={() => handleCancelExpedition(row.id!)}
                  >
                    Cancel
                  </Button>
                )}
              </>
            )}
          </Group>
        ),
      },
    ],
    [handleEndExpedition, handleCancelExpedition, isManager]
  );

  return (
    <DataTable.Container>
      <DataTable.Title
        icon={<IconTruckDelivery size={25} />}
        title="Expeditions"
        actions={
          <AddButton variant="default" size="xs" onClick={() => openExpeditionCreate(refetch)}>
            Start Expedition
          </AddButton>
        }
      />
      <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
      <DataTable.Content>
        <DataTable.Table
          striped
          minHeight={240}
          noRecordsText={DataTable.noRecordsText('expeditions')}
          recordsPerPageLabel={DataTable.recordsPerPageLabel('expeditions')}
          paginationText={DataTable.paginationText('expeditions')}
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
