import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { paths } from '@/routes';
import { Stack } from '@mantine/core';
import { ITTicketAnalytics } from './it-tickets-analytics';
import { ITTicketsTable } from './it-tickets-table';

export default function ITTicketsPage() {
  const { user } = useAuth();

  const itTicketsPath =
    user?.role === 'MANAGER' ? paths.manager.itTickets : paths.employee.itTickets;
  const breadcrumbs = [{ label: 'IT Tickets', href: itTicketsPath }];

  return (
    <Page title="IT Tickets">
      <PageHeader title="IT Tickets" breadcrumbs={breadcrumbs} />

      <Stack gap="lg">
        <ITTicketAnalytics />
        <ITTicketsTable />
      </Stack>
    </Page>
  );
}
