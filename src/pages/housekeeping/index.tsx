import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { paths } from '@/routes';
import { Stack } from '@mantine/core';
import { HousekeepingAnalytics } from './housekeeping-analytics';
import { HousekeepingTable } from './housekeeping-table';

export default function HousekeepingPage() {
  const { user } = useAuth();

  const housekeepingPath =
    user?.role === 'MANAGER'
      ? paths.manager.housekeeping
      : paths.employee.housekeeping;
  const breadcrumbs = [{ label: 'Housekeeping', href: housekeepingPath }];

  return (
    <Page title="Housekeeping">
      <PageHeader title="Housekeeping" breadcrumbs={breadcrumbs} />

      <Stack gap="lg">
        <HousekeepingAnalytics />
        <HousekeepingTable />
      </Stack>
    </Page>
  );
}
