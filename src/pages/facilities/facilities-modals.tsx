import { Box, SimpleGrid, Stack } from '@mantine/core';
import { modals } from '@mantine/modals';
import { ViewFacility } from '@/pages/facilities/facilitoes-view';
import { CreateFacilityForm, EditFacilityForm } from './facilities-forms';

interface openFacilityViewProps {
  facilityId: string;
}

export function openFacilityCreate(refetch: () => void) {
  modals.open({
    title: 'Add new facility',
    children: (
      <CreateFacilityForm
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

export function openFacilityEdit(id: string, refetch: () => void) {
  modals.open({
    title: 'Edit facility',
    children: (
      <EditFacilityForm
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

export function openFacilityView(facilityId: string) {
  modals.open({
    title: 'View facility',
    children: <ViewFacility id={facilityId} />,
    size: '75rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}
