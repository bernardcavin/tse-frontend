import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { paths } from '@/routes';
import { ContactsTable } from './contacts-table';

export default function ContactsPage() {
  const { user } = useAuth();

  const contactsPath =
    user?.role === 'MANAGER' ? paths.manager.contacts : paths.employee.contacts;
  const breadcrumbs = [{ label: 'Contacts', href: contactsPath }, { label: 'List' }];

  return (
    <Page title="Contacts">
      <PageHeader title="Contacts" breadcrumbs={breadcrumbs} />
      <ContactsTable />
    </Page>
  );
}
