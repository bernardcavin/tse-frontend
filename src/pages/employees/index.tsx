import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { EmployeeTable } from '@/pages/employees/employee-table';
import { paths } from '@/routes';

const breadcrumbs = [{ label: 'Employees', href: paths.manager.employees }, { label: 'List' }];

export default function EmployeesPage() {
  return (
    <Page title="Employees">
      <PageHeader title="Employee Management" breadcrumbs={breadcrumbs} />

      <EmployeeTable />
    </Page>
  );
}
