import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { FacilitiesTable } from '@/pages/facilities/facilities-table';
import { paths } from '@/routes';

const breadcrumbs = [{ label: 'Facilities', href: paths.facilities.root }, { label: 'List' }];

export default function FacilitiesPage() {
  return (
    <Page title="Facilities">
      <PageHeader title="Facilities" breadcrumbs={breadcrumbs} />

      <FacilitiesTable />
    </Page>
  );
}
