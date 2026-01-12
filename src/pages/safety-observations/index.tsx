import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { paths } from '@/routes';
import { Stack } from '@mantine/core';
import { SafetyAnalytics } from './safety-analytics';
import { SafetyObservationsTable } from './safety-observations-table';

export default function SafetyObservationsPage() {
  const { user } = useAuth();

  const hazardPath =
    user?.role === 'MANAGER'
      ? paths.manager.safetyObservations
      : paths.employee.safetyObservations;
  const breadcrumbs = [{ label: 'Safety Observations', href: hazardPath }];

  return (
    <Page title="Safety Observations">
      <PageHeader title="Safety Observation Cards" breadcrumbs={breadcrumbs} />

      <Stack gap="lg">
        <SafetyAnalytics />
        <SafetyObservationsTable />
      </Stack>
    </Page>
  );
}
