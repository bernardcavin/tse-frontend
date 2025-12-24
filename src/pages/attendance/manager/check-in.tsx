import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { paths } from '@/routes';
import { EmployeeCheckIn } from '../employee/employee-check-in';

export default function ManagerCheckInPage() {
  const { user } = useAuth();

  const attendancePath =
    user?.role === 'MANAGER' ? paths.manager.attendance : paths.employee.attendance;
  const breadcrumbs = [
    { label: 'Attendance', href: attendancePath },
    { label: 'Check In' },
  ];

  return (
    <Page title="Attendance - Check In">
      <PageHeader title="Check In" breadcrumbs={breadcrumbs} />
      <EmployeeCheckIn />
    </Page>
  );
}
