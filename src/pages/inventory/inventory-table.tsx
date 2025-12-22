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
import { Badge, Tabs, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
    IconBriefcase,
    IconBuildingWarehouse,
    IconCategory,
    IconDeviceDesktop,
    IconDots,
    IconFirstAidKit,
    IconPackage,
    IconShieldCheck,
    IconShoppingCart,
    IconSofa,
    IconTool,
} from '@tabler/icons-react';
import { DataTableColumn } from 'mantine-datatable';
import { QRCodeCanvas } from 'qrcode.react';
import { useCallback, useMemo, useState } from 'react';
import z from 'zod';
import { openInventoryCreate, openInventoryEdit, openInventoryView } from './inventory-modals';

type InventoryType = z.infer<typeof Inventory>;

type SortableFields = Pick<
  InventoryType,
  'item_name' | 'item_category' | 'item_description' | 'item_code'
>;

// Category definitions with icons
const CATEGORIES = [
  { value: 'all', label: 'All', icon: IconCategory },
  { value: 'Safety Equipment', label: 'Safety Equipment', icon: IconShieldCheck },
  { value: 'Office Supplies', label: 'Office Supplies', icon: IconBriefcase },
  { value: 'Tools & Equipment', label: 'Tools & Equipment', icon: IconTool },
  { value: 'Furniture', label: 'Furniture', icon: IconSofa },
  { value: 'Electronics', label: 'Electronics', icon: IconDeviceDesktop },
  { value: 'Consumables', label: 'Consumables', icon: IconShoppingCart },
  { value: 'Raw Materials', label: 'Raw Materials', icon: IconPackage },
  { value: 'Maintenance Supplies', label: 'Maintenance Supplies', icon: IconBuildingWarehouse },
  { value: 'Medical Supplies', label: 'Medical Supplies', icon: IconFirstAidKit },
  { value: 'Other', label: 'Other', icon: IconDots },
] as const;

export function InventoryTable() {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';
  const [activeCategory, setActiveCategory] = useState<string>('all');

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

  // Filter data based on selected category
  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    if (activeCategory === 'all') return data.data;
    return data.data.filter((item) => item.item_category === activeCategory);
  }, [data?.data, activeCategory]);

  // Count items per category for badge display
  const categoryCounts = useMemo(() => {
    if (!data?.data) return {};
    const counts: Record<string, number> = { all: data.data.length };
    data.data.forEach((item) => {
      const category = item.item_category || 'Other';
      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  }, [data?.data]);

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
      ...(activeCategory === 'all'
        ? [
            {
              accessor: 'item_category',
              title: 'Category',
              sortable: true,
            } as DataTableColumn<InventoryType>,
          ]
        : []),
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
    [isManager, handleDelete, activeCategory]
  );

  const Icon = icons.inventory;

  // Handle tab change and reset page
  const handleCategoryChange = (value: string | null) => {
    if (value) {
      setActiveCategory(value);
      setPage(1);
    }
  };

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

      {/* Category Tabs */}
      <Tabs
        value={activeCategory}
        onChange={handleCategoryChange}
        variant="outline"
        mb="md"
        styles={{
          root: { overflow: 'auto' },
          list: { flexWrap: 'nowrap' },
        }}
      >
        <Tabs.List>
          {CATEGORIES.map((category) => {
            const CategoryIcon = category.icon;
            const count = categoryCounts[category.value] || 0;
            return (
              <Tabs.Tab
                key={category.value}
                value={category.value}
                leftSection={<CategoryIcon size={16} />}
                rightSection={
                  count > 0 ? (
                    <Badge size="xs" variant="filled" circle>
                      {count}
                    </Badge>
                  ) : null
                }
              >
                {category.label}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs>

      <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
      <DataTable.Content>
        <DataTable.Table
          striped
          minHeight={240}
          noRecordsText={DataTable.noRecordsText('inventory')}
          recordsPerPageLabel={DataTable.recordsPerPageLabel('inventory')}
          paginationText={DataTable.paginationText('inventory')}
          page={page}
          records={filteredData}
          fetching={isLoading}
          onPageChange={setPage}
          recordsPerPage={limit}
          totalRecords={filteredData.length}
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
