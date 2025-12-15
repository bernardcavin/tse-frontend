import { Box, SimpleGrid, Stack } from '@mantine/core';
import { modals } from '@mantine/modals';
import { ViewInventoryForm } from '@/pages/inventory/inventory-view';
import { CreateInventoryForm, EditInventoryForm } from './inventory-forms';

interface openInventoryViewProps {
  inventoryId: string;
}

export function openInventoryCreate(refetch: () => void) {
  modals.open({
    title: 'Add new inventory',
    children: (
      <CreateInventoryForm
        onSubmit={() => {
          refetch();
          modals.closeAll();
        }}
      />
    ),
    size: '75rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openInventoryEdit(id: string, refetch: () => void) {
  modals.open({
    title: 'Edit inventory',
    children: (
      <EditInventoryForm
        id={id}
        onSubmit={() => {
          refetch();
          modals.closeAll();
        }}
      />
    ),
    size: '75rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openInventoryView(id: string) {
  modals.open({
    title: 'View inventory',
    children: <ViewInventoryForm id={id} />,
    size: '75rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}
