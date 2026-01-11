import { Page } from '@/components/page';
import { ExpeditionsTable } from './expeditions-table';

export default function ExpeditionsPage() {
  return (
    <Page title="Expeditions" breadcrumbs={[{ title: 'Expeditions', href: '#' }]}>
      <ExpeditionsTable />
    </Page>
  );
}
