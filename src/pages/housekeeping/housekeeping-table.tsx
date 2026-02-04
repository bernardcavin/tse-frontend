import { useCallback, useMemo, useState } from 'react';
import { DataTableColumn } from 'mantine-datatable';
import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { HousekeepingType } from '@/api/entities/housekeeping';
import { usePagination } from '@/api/helpers';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import { useAuth } from '@/hooks';
import { useDeleteHousekeeping, useGetHousekeepingList } from '@/hooks/api/housekeeping';
import { formatDateReadable } from '@/utilities/date';
import { icons } from '@/utilities/icons';
import {
  CreateHousekeepingModal,
  EditHousekeepingModal,
  ViewHousekeepingModal,
} from './housekeeping-modals';

type SortableFields = Pick<
  HousekeepingType,
  'location_area' | 'inspection_date' | 'inspector_name'
>;

export function HousekeepingTable() {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';
  const canCreate = user?.role === 'MANAGER' || user?.department === 'HSE';

  const { page, limit, setLimit, setPage } = usePagination();
  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'desc',
      column: 'inspection_date',
    },
  });

  const {
    data: housekeepingData,
    isLoading,
    refetch,
  } = useGetHousekeepingList({
    query: {
      page,
      limit,
      sort: sort.query,
    },
  });
  const { mutate: deleteHousekeeping } = useDeleteHousekeeping();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedHousekeeping, setSelectedHousekeeping] = useState<HousekeepingType | null>(null);

  const housekeepingList: HousekeepingType[] = housekeepingData?.data || [];

  const handleView = useCallback((housekeeping: HousekeepingType) => {
    setSelectedHousekeeping(housekeeping);
    setViewModalOpen(true);
  }, []);

  const handleEdit = useCallback((housekeeping: HousekeepingType) => {
    setSelectedHousekeeping(housekeeping);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    (housekeeping: HousekeepingType) => {
      modals.openConfirmModal({
        title: 'Delete Housekeeping Checklist',
        children: (
          <Text>
            Are you sure you want to delete the checklist at {housekeeping.location_area}? This
            action cannot be undone.
          </Text>
        ),
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        onConfirm: async () => {
          try {
            await deleteHousekeeping({ route: { id: housekeeping.id! } });
            notifications.show({
              title: 'Success',
              message: 'Housekeeping checklist deleted successfully',
              color: 'green',
            });
            refetch();
          } catch (error: any) {
            notifications.show({
              title: 'Error',
              message: error.response?.data?.detail || 'Failed to delete checklist',
              color: 'red',
            });
          }
        },
      });
    },
    [deleteHousekeeping, refetch]
  );

  const columns: DataTableColumn<HousekeepingType>[] = useMemo(
    () => [
      {
        accessor: 'location_area',
        title: 'Location/Area',
        sortable: true,
      },
      {
        accessor: 'facility_name',
        title: 'Facility',
        render: ({ facility_name }) => facility_name || '-',
      },
      {
        accessor: 'inspection_date',
        title: 'Date',
        sortable: true,
        render: ({ inspection_date }) =>
          inspection_date ? formatDateReadable(inspection_date) : '-',
      },
      {
        accessor: 'inspector_name',
        title: 'Inspector',
        sortable: true,
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        width: 130,
        render: (row: HousekeepingType) => (
          <DataTable.Actions
            onView={() => handleView(row)}
            onEdit={isManager ? () => handleEdit(row) : undefined}
            onDelete={isManager ? () => handleDelete(row) : undefined}
          />
        ),
      },
    ],
    [isManager, handleView, handleEdit, handleDelete]
  );

  const Icon = icons.clipboardCheck;

  return (
    <>
      <DataTable.Container>
        <DataTable.Title
          icon={<Icon size={25} />}
          title="Housekeeping Checklists"
          actions={
            canCreate && (
              <AddButton variant="default" size="xs" onClick={() => setCreateModalOpen(true)}>
                Create Checklist
              </AddButton>
            )
          }
        />
        <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
        <DataTable.Content>
          <DataTable.Table
            striped
            minHeight={240}
            noRecordsText={DataTable.noRecordsText('housekeeping checklists')}
            recordsPerPageLabel={DataTable.recordsPerPageLabel('checklists')}
            paginationText={DataTable.paginationText('checklists')}
            page={page}
            records={housekeepingList}
            fetching={isLoading}
            onPageChange={setPage}
            recordsPerPage={limit}
            totalRecords={housekeepingList.length}
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

      {/* Modals */}
      <CreateHousekeepingModal
        opened={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          refetch();
        }}
      />
      {selectedHousekeeping && (
        <>
          <ViewHousekeepingModal
            opened={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedHousekeeping(null);
            }}
            housekeeping={selectedHousekeeping}
          />
          <EditHousekeepingModal
            opened={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedHousekeeping(null);
              refetch();
            }}
            housekeeping={selectedHousekeeping}
          />
        </>
      )}
    </>
  );
}
