import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { FacilitiesTable } from '@/pages/facilities/facilities-table';
import { paths } from '@/routes';

export default function FacilitiesPage() {
  const { user } = useAuth();
  
  const facilitiesPath = user?.role === 'MANAGER' ? paths.manager.facilities : paths.employee.facilities;
  const breadcrumbs = [{ label: 'Facilities', href: facilitiesPath }, { label: 'List' }];

  return (
    <Page title="Facilities">
      <PageHeader title="Facilities" breadcrumbs={breadcrumbs} />

      <FacilitiesTable />
    </Page>
  );
}
