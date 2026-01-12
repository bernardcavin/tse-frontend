import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { ExpeditionsTable } from './expeditions-table';

export default function ExpeditionsPage() {
  return (
    <Page title="Expeditions">
      <PageHeader title="Expeditions" breadcrumbs={[{ label: 'Expeditions', href: '#' }]} />
      <ExpeditionsTable />
    </Page>
  );
}
