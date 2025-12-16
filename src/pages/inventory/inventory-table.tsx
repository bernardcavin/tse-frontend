import { Inventory } from '@/api/entities/inventory';
import { usePagination } from '@/api/helpers';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import { MultipleImageAttachment } from '@/components/image-attachment';
import { LocationBadge } from '@/components/resources/storage-badge';
import { useAuth } from '@/hooks';
import { useDeleteInventory, useGetInventoryList } from '@/hooks/api/inventory';
import { formatDateReadable } from '@/utilities/date';
import { icons } from '@/utilities/icons';
import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { DataTableColumn } from 'mantine-datatable';
import { QRCodeCanvas } from 'qrcode.react';
import { useCallback, useMemo } from 'react';
import z from 'zod';
import { openInventoryCreate, openInventoryEdit, openInventoryView } from './inventory-modals';

type InventoryType = z.infer<typeof Inventory>;

type SortableFields = Pick<
  InventoryType,
  'item_name' | 'item_category' | 'item_description' | 'item_code'
>;

export function InventoryTable() {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';

  const { page, limit, setLimit, setPage } = usePagination();
  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'asc',
      column: 'item_name',
    },
  });

  const { data, isLoading, refetch } = useGetInventoryList({
    query: {
      page,
      limit,
      sort: sort.query,
    },
  });

  const { mutate: deleteInventory } = useDeleteInventory();
  const handleDelete = useCallback(
    (id: string) => {
      modals.openConfirmModal({
        title: 'Delete Inventory',
        children: 'Are you sure you want to delete this inventory?',
        confirmProps: { color: 'red' },
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        onConfirm: () => {
          deleteInventory({ route: { id } });
          refetch();
        },
      });
    },
    [deleteInventory, refetch]
  );

  const columns: DataTableColumn<InventoryType>[] = useMemo(
    () => [
      {
        accessor: 'photo_file_ids',
        title: 'Photo',
        textAlign: 'center',
        width: 300,
        render: ({ photo_file_ids }) =>
          photo_file_ids?.length ? (
            <MultipleImageAttachment
              file_ids={photo_file_ids}
              alt="Inventory Photo"
              thumbnailWidth={80}
              thumbnailHeight={80}
              enlarge={false}
            />
          ) : (
            <Text>No Photo</Text>
          ),
      },
      {
        accessor: 'item_name',
        title: 'Inventory',
        sortable: true,
      },
      {
        accessor: 'item_code',
        title: 'Code',
        sortable: true,
      },
      {
        accessor: 'manufacturer',
        title: 'Manufacturer',
        sortable: true,
      },
      {
        accessor: 'item_category',
        title: 'Category',
        sortable: true,
      },
      {
        accessor: 'quantity',
        title: 'Quantity',
        sortable: true,
        render: ({ quantity, quantity_uom }) => `${quantity} ${quantity_uom}`,
      },
      {
        accessor: 'minimum_stock_level',
        title: 'Min. Stock',
        sortable: true,
        render: ({ quantity, minimum_stock_level }) =>
          quantity < minimum_stock_level
            ? `${minimum_stock_level} (Out of Stock)`
            : minimum_stock_level,
      },
      {
        accessor: 'condition_status',
        title: 'Condition',
        sortable: true,
      },
      {
        accessor: 'last_inspection_date',
        title: 'Last Inspection',
        sortable: true,
        render: ({ last_inspection_date }) =>
          last_inspection_date ? formatDateReadable(last_inspection_date) : '-',
      },
      {
        accessor: 'next_inspection_due',
        title: 'Next Inspection',
        sortable: true,
        render: ({ next_inspection_due }) =>
          next_inspection_due ? formatDateReadable(next_inspection_due) : '-',
      },
      {
        accessor: 'storage_location',
        title: 'Storage Location',
        sortable: true,
        render: ({ storage_location }) => storage_location?.facility_name ?? '-',
      },
      {
        accessor: 'location_status',
        title: 'Status',
        width: 120,
        render: ({ location_status }) => <LocationBadge value={location_status} />,
      },
      {
        accessor: 'id',
        title: 'QR Code',
        render: ({ id }) => (id ? <QRCodeCanvas value={id} /> : <Text>No QR Code</Text>),
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        width: 130,
        render: (row: any) => (
          <DataTable.Actions
            onEdit={() => openInventoryEdit(row.id, refetch)}
            onView={() => openInventoryView(row.id)}
            onDelete={isManager ? () => handleDelete(row.id) : undefined}
          />
        ),
      },
    ],
    [isManager, handleDelete]
  );

  const Icon = icons.inventory;

  return (
    <DataTable.Container>
      <DataTable.Title
        icon={<Icon size={25} />}
        title="Inventory"
        actions={
          <AddButton variant="default" size="xs" onClick={() => openInventoryCreate(refetch)}>
            Add Inventory
          </AddButton>
        }
      />
      <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
      <DataTable.Content>
        <DataTable.Table
          striped
          minHeight={240}
          noRecordsText={DataTable.noRecordsText('inventory')}
          recordsPerPageLabel={DataTable.recordsPerPageLabel('inventory')}
          paginationText={DataTable.paginationText('inventory')}
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
