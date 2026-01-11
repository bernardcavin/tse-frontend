import { modals } from '@mantine/modals';
import { CreateExpeditionForm } from './expeditions-forms';
import { ViewExpedition } from './expeditions-view';

export function openExpeditionCreate(refetch: () => void) {
  modals.open({
    title: 'Start New Expedition',
    children: (
      <CreateExpeditionForm
        onSubmit={() => {
          refetch();
          modals.closeAll();
        }}
      />
    ),
    size: '40rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openExpeditionView(id: string) {
  modals.open({
    title: 'View Expedition',
    children: <ViewExpedition id={id} />,
    size: '70rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}
