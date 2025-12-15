import { useCallback, useMemo } from 'react';
import { DataTableColumn } from 'mantine-datatable';
import z from 'zod';
import { Avatar, Group, Loader, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Facility } from '@/api/entities/facility';
import { usePagination } from '@/api/helpers';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import { MultipleImageAttachment } from '@/components/image-attachment';
import { ActiveBadge } from '@/components/resources/active-badge';
import { app } from '@/config';
import { useDeleteFacility, useGetfacilities } from '@/hooks/api/facilities';
import { formatDateReadable } from '@/utilities/date';
import { icons } from '@/utilities/icons';
import { formatCurrency } from '@/utilities/number';
import { titlize } from '@/utilities/text';
import { openFacilityCreate, openFacilityEdit, openFacilityView } from './facilities-modals';

type FacilityType = z.infer<typeof Facility>;

type SortableFields = Pick<
  FacilityType,
  'facility_name' | 'facility_type' | 'address' | 'city' | 'province' | 'country'
>;

export function FacilitiesTable() {
  const { page, limit, setLimit, setPage } = usePagination();
  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'asc',
      column: 'facility_name',
    },
  });

  const { data, isLoading, refetch } = useGetfacilities({
    query: {
      page,
      limit,
      sort: sort.query,
    },
  });

  const { mutate: deleteFacility } = useDeleteFacility();
  const handleDelete = useCallback(
    (id: string) => {
      modals.openConfirmModal({
        title: 'Delete Facility',
        children: 'Are you sure you want to delete this facility?',
        confirmProps: { color: 'red' },
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        onConfirm: () => {
          deleteFacility({ route: { id } });
          refetch();
        },
      });
    },
    [deleteFacility, refetch]
  );

  const columns: DataTableColumn<FacilityType>[] = useMemo(
    () => [
      {
        accessor: 'photo_file_ids',
        title: 'Photo',
        textAlign: 'center',
        width: 300,
        render: ({ photo_file_ids }) =>
          photo_file_ids ? (
            <MultipleImageAttachment
              file_ids={photo_file_ids}
              alt="Facility Photo"
              thumbnailWidth={80}
              thumbnailHeight={80}
              enlarge={false}
            />
          ) : (
            <Text>No Photo</Text>
          ),
      },
      {
        accessor: 'facility_name',
        title: 'Facility Name',
      },
      {
        accessor: 'facility_type',
        title: 'Type',
        render: ({ facility_type }) => titlize(facility_type),
      },
      { accessor: 'address', title: 'Address' },
      { accessor: 'city', title: 'City' },
      { accessor: 'province', title: 'Province' },
      { accessor: 'country', title: 'Country' },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        width: 130,
        render: (row: any) => (
          <DataTable.Actions
            onView={() => openFacilityView(row.id)}
            onEdit={() => openFacilityEdit(row.id, refetch)}
            onDelete={() => handleDelete(row.id)}
          />
        ),
      },
    ],
    []
  );

  const Icon = icons.facilities;

  return (
    <DataTable.Container>
      <DataTable.Title
        icon={<Icon size={25} />}
        title="Facilities"
        actions={
          <AddButton variant="default" size="xs" onClick={() => openFacilityCreate(refetch)}>
            Add Facility
          </AddButton>
        }
      />
      <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
      <DataTable.Content>
        <DataTable.Table
          striped
          minHeight={240}
          noRecordsText={DataTable.noRecordsText('facilities')}
          recordsPerPageLabel={DataTable.recordsPerPageLabel('facilities')}
          paginationText={DataTable.paginationText('facilities')}
          page={page}
          records={data?.data ?? []}
          fetching={isLoading}
          onPageChange={setPage}
          recordsPerPage={limit}
          totalRecords={data?.meta.total ?? 0}
          onRecordsPerPageChange={setLimit}
          recordsPerPageOptions={[5, 15, 30]}
          sortStatus={sort.status}
          onSortStatusChange={sort.change}
          columns={columns}
          pinLastColumn
          pinFirstColumn
          highlightOnHover
        />
      </DataTable.Content>
    </DataTable.Container>
  );
}
