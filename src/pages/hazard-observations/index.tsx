import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { paths } from '@/routes';
import { Stack } from '@mantine/core';
import { HazardAnalytics } from './hazard-analytics';
import { HazardObservationsTable } from './hazard-observations-table';

export default function HazardObservationsPage() {
  const { user } = useAuth();

  const hazardPath =
    user?.role === 'MANAGER'
      ? paths.manager.hazardObservations
      : paths.employee.hazardObservations;
  const breadcrumbs = [{ label: 'Hazard Observations', href: hazardPath }];

  return (
    <Page title="Hazard Observations">
      <PageHeader title="Hazard Observation Cards" breadcrumbs={breadcrumbs} />

      <Stack gap="lg">
        <HazardAnalytics />
        <HazardObservationsTable />
      </Stack>
    </Page>
  );
}
