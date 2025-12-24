import { ViewContact } from '@/pages/contacts/contacts-view';
import { modals } from '@mantine/modals';
import { CreateContactForm, EditContactForm } from './contacts-forms';

export function openContactCreate(refetch: () => void) {
  modals.open({
    title: 'Add new contact',
    children: (
      <CreateContactForm
        onSubmit={() => {
          refetch();
          modals.closeAll();
        }}
      />
    ),
    size: '60rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openContactEdit(id: string, refetch: () => void) {
  modals.open({
    title: 'Edit contact',
    children: (
      <EditContactForm
        id={id}
        onSubmit={() => {
          refetch();
          modals.closeAll();
        }}
      />
    ),
    size: '60rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openContactView(contactId: string) {
  modals.open({
    title: 'View contact',
    children: <ViewContact id={contactId} />,
    size: '60rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}
