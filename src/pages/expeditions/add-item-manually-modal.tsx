import { Inventory } from '@/api/entities/inventory';
import { usePagination } from '@/api/helpers';
import { DataTable } from '@/components/data-table';
import { MultipleImageAttachment } from '@/components/image-attachment';
import { useAddExpeditionItem } from '@/hooks/api/expeditions';
import { useGetInventoryList } from '@/hooks/api/inventory';
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  NumberInput,
  Text
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { DataTableColumn } from 'mantine-datatable';
import { useMemo, useState } from 'react';
import z from 'zod';

type InventoryType = z.infer<typeof Inventory>;

type SortableFields = Pick<
  InventoryType,
  'item_name' | 'item_category' | 'item_code'
>;

interface AddItemFromInventoryModalProps {
  opened: boolean;
  onClose: () => void;
  expeditionId: string;
  expeditionItems: Array<{ inventory_id: string; quantity: number }>;
  onSuccess: () => void;
}

export function AddItemFromInventoryModal({
  opened,
  onClose,
  expeditionId,
  expeditionItems,
  onSuccess,
}: AddItemFromInventoryModalProps) {
  const { page, limit, setLimit, setPage } = usePagination();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [pendingAdds, setPendingAdds] = useState<Record<string, number>>({});

  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'asc',
      column: 'item_name',
    },
  });

  const { data, isLoading } = useGetInventoryList({
    query: {
      page,
      limit,
      sort: sort.query,
    },
  });

  const { mutate: addItem, isPending } = useAddExpeditionItem();

  // Calculate how much stock is already allocated to this expedition
  const getAllocatedQuantity = (inventoryId: string): number => {
    const expeditionQty = expeditionItems.find((item) => item.inventory_id === inventoryId)?.quantity || 0;
    const pendingQty = pendingAdds[inventoryId] || 0;
    return expeditionQty + pendingQty;
  };

  // Calculate remaining available stock for an item
  const getRemainingStock = (item: InventoryType): number => {
    const allocated = getAllocatedQuantity(item.id!);
    return Math.max(0, item.quantity - allocated);
  };

  const handleAddItem = (item: InventoryType) => {
    const quantity = quantities[item.id!] || 1;
    const remainingStock = getRemainingStock(item);

    // Validate quantity
    if (quantity <= 0) {
      notifications.show({
        title: 'Invalid Quantity',
        message: 'Quantity must be greater than 0',
        color: 'red',
      });
      return;
    }

    if (quantity > remainingStock) {
      const allocated = getAllocatedQuantity(item.id!);
      notifications.show({
        title: 'Insufficient Stock',
        message: `Only ${remainingStock} ${item.quantity_uom || 'units'} remaining for "${item.item_name}" (${allocated} already in expedition)`,
        color: 'red',
      });
      return;
    }

    addItem(
      {
        route: { expeditionId },
        variables: {
          inventory_id: item.id!,
          quantity,
        },
      },
      {
        onSuccess: () => {
          // Track this addition in pending state
          setPendingAdds((prev) => ({
            ...prev,
            [item.id!]: (prev[item.id!] || 0) + quantity,
          }));
          
          // Reset quantity for this item
          setQuantities((prev) => ({ ...prev, [item.id!]: 1 }));
          
          onSuccess();
        },
      }
    );
  };

  const setQuantity = (itemId: string, value: number | string, maxStock: number) => {
    let numValue = typeof value === 'number' ? value : parseFloat(value) || 1;
    
    // Clamp value between 1 and maxStock
    numValue = Math.max(1, Math.min(numValue, maxStock));
    
    setQuantities((prev) => ({
      ...prev,
      [itemId]: numValue,
    }));
  };

  const columns: DataTableColumn<InventoryType>[] = useMemo(
    () => [
      {
        accessor: 'photo_file_ids',
        title: 'Photo',
        textAlign: 'center',
        width: 100,
        render: ({ photo_file_ids }) =>
          photo_file_ids?.length ? (
            <MultipleImageAttachment
              file_ids={photo_file_ids}
              alt="Inventory Photo"
              thumbnailWidth={60}
              thumbnailHeight={60}
              enlarge={false}
            />
          ) : (
            <Text c="dimmed" fz="sm">
              No Photo
            </Text>
          ),
      },
      {
        accessor: 'item_name',
        title: 'Item Name',
        sortable: true,
      },
      {
        accessor: 'item_code',
        title: 'Code',
        sortable: true,
        width: 120,
      },
      {
        accessor: 'item_category',
        title: 'Category',
        sortable: true,
        width: 150,
      },
      {
        accessor: 'quantity',
        title: 'Stock',
        sortable: true,
        width: 150,
        render: (item: InventoryType) => {
          const allocated = getAllocatedQuantity(item.id!);
          const remaining = getRemainingStock(item);
          
          return (
            <div>
              <Text fw={500}>
                {remaining} {item.quantity_uom || 'units'}
              </Text>
              {allocated > 0 && (
                <Text fz="xs" c="dimmed">
                  ({allocated} in expedition)
                </Text>
              )}
            </div>
          );
        },
      },
      {
        accessor: 'location_status',
        title: 'Status',
        width: 120,
        render: ({ location_status }) => (
          <Text tt="capitalize" c={location_status === 'in_storage' ? 'green' : 'orange'}>
            {location_status?.replace('_', ' ')}
          </Text>
        ),
      },
      {
        accessor: 'actions',
        title: 'Add to Expedition',
        textAlign: 'right',
        width: 220,
        render: (row: InventoryType) => {
          const remainingStock = getRemainingStock(row);
          const isOutOfStock = remainingStock === 0;
          
          return (
            <Group gap="xs" justify="flex-end">
              <NumberInput
                value={quantities[row.id!] || 1}
                onChange={(value) => setQuantity(row.id!, value, remainingStock)}
                min={1}
                max={remainingStock}
                style={{ width: 100 }}
                size="xs"
                disabled={isPending || isOutOfStock}
                clampBehavior="strict"
              />
              <ActionIcon
                color="blue"
                variant="filled"
                onClick={() => handleAddItem(row)}
                disabled={isPending || isOutOfStock}
                size="lg"
                title={isOutOfStock ? 'Out of stock' : 'Add to expedition'}
              >
                <IconPlus size={18} />
              </ActionIcon>
            </Group>
          );
        },
      },
    ],
    [quantities, isPending, handleAddItem]
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add Items from Inventory"
      size="95%"
      zIndex={3000}
    >
      <DataTable.Container>
        <Group mb="md"  justify="flex-end">
          <Button variant="subtle" onClick={onClose}>
            Done
          </Button>
        </Group>

        <DataTable.Content>
          <DataTable.Table
            striped
            minHeight={400}
            noRecordsText="No inventory items found"
            recordsPerPageLabel="Items per page"
            paginationText={({ from, to, totalRecords }) =>
              `Showing ${from} to ${to} of ${totalRecords} items`
            }
            page={page}
            records={data?.data ?? []}
            fetching={isLoading}
            onPageChange={setPage}
            recordsPerPage={limit}
            totalRecords={data?.meta?.total ?? 0}
            onRecordsPerPageChange={setLimit}
            recordsPerPageOptions={[10, 25, 50]}
            sortStatus={sort.status}
            onSortStatusChange={sort.change}
            columns={columns}
            pinLastColumn
            highlightOnHover
          />
        </DataTable.Content>
      </DataTable.Container>
    </Modal>
  );
}
