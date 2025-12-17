import {
  HazardObservationType,
  ObservationStatusType,
} from '@/api/entities/hazard-observations';
import { usePagination } from '@/api/helpers';
import {
  useDeleteHazardObservation,
  useHazardObservations,
} from '@/api/resources/hazard-observations';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import { useAuth } from '@/hooks';
import { icons } from '@/utilities/icons';
import { Badge, Group } from '@mantine/core';
import { modals } from '@mantine/modals';
import { DataTableColumn } from 'mantine-datatable';
import { useCallback, useMemo } from 'react';
import {
  openHazardObservationCreate,
  openHazardObservationEdit,
  openHazardObservationResolve,
  openHazardObservationView,
} from './hazard-observations-modals';

const STATUS_COLORS: Record<ObservationStatusType, string> = {
  open: 'red',
  in_progress: 'yellow',
  resolved: 'green',
  closed: 'gray',
};

const STATUS_LABELS: Record<ObservationStatusType, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

type SortableFields = Pick<
  HazardObservationType,
  'observation_date' | 'status'
>;

export function HazardObservationsTable() {
  const { user } = useAuth();
  const { page, limit, setLimit, setPage } = usePagination();

  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'desc',
      column: 'observation_date',
    },
  });

  const { data, isLoading, refetch } = useHazardObservations();

  const { mutate: deleteObservation } = useDeleteHazardObservation();
  
  const handleDelete = useCallback(
    (id: string) => {
      modals.openConfirmModal({
        title: 'Delete Hazard Observation',
        children: 'Are you sure you want to delete this hazard observation?',
        confirmProps: { color: 'red' },
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        onConfirm: () => {
          deleteObservation(id);
          refetch();
        },
      });
    },
    [deleteObservation, refetch]
  );

  const isHSE = user?.department === 'HSE';
  const isManager = user?.role === 'MANAGER';

  const columns: DataTableColumn<HazardObservationType>[] = useMemo(
    () => [
      {
        accessor: 'observation_date',
        title: 'Date',
        sortable: true,
        render: ({ observation_date, observation_time }) => {
          const date = new Date(observation_date);
          return `${date.toLocaleDateString()} ${observation_time || ''}`;
        },
      },
      {
        accessor: 'facility_id',
        title: 'Facility',
        ellipsis: true,
        render: ({ facility_name, facility_id }) => facility_name || facility_id,
      },
      {
        accessor: 'unsafe_action_condition',
        title: 'Unsafe Condition',
        ellipsis: true,
        width: 250,
      },
      {
        accessor: 'hazard_types',
        title: 'Hazard Types',
        render: ({ hazard_types }) =>
          hazard_types && hazard_types.length > 0 ? (
            <Group gap={4}>
              {hazard_types.slice(0, 2).map((type, idx) => (
                <Badge key={idx} size="sm" >
                  {type}
                </Badge>
              ))}
              {hazard_types.length > 2 && (
                <Badge size="sm" variant="outline">
                  +{hazard_types.length - 2}
                </Badge>
              )}
            </Group>
          ) : (
            '-'
          ),
      },
      {
        accessor: 'status',
        title: 'Status',
        sortable: true,
        textAlign: 'center',
        render: ({ status }) => (
          <Badge color={STATUS_COLORS[status]} >
            {STATUS_LABELS[status]}
          </Badge>
        ),
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        width: 180,
        render: (row: HazardObservationType) => (
          <DataTable.Actions
            onView={() => openHazardObservationView(row.id!)}
            onResolve={
              isHSE && row.status !== 'resolved' && row.status !== 'closed'
                ? () => openHazardObservationResolve(row.id!, refetch)
                : null
            }
            onEdit={
              isManager || row.observer_id === user?.id
                ? () => openHazardObservationEdit(row.id!, refetch)
                : null
            }
            onDelete={isManager ? () => handleDelete(row.id!) : null}
          />
        ),
      },
    ],
    [handleDelete, isHSE, isManager, user?.id, refetch]
  );

  const Icon = icons.alert;

  return (
    <DataTable.Container>
      <DataTable.Title
        icon={<Icon size={25} />}
        title="Hazard Observation Cards"
        actions={
          <AddButton
            variant="default"
            size="xs"
            onClick={() => openHazardObservationCreate(refetch)}
          >
            Add Observation
          </AddButton>
        }
      />
      <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
      <DataTable.Content>
        <DataTable.Table
          striped
          minHeight={240}
          noRecordsText={DataTable.noRecordsText('hazard observations')}
          recordsPerPageLabel={DataTable.recordsPerPageLabel('hazard observations')}
          paginationText={DataTable.paginationText('hazard observations')}
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
