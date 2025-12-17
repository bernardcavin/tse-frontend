import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { paths } from '@/routes';
import { EmployeeCheckIn } from './employee-check-in';

export default function EmployeeAttendancePage() {
  const { user } = useAuth();

  const attendancePath =
    user?.role === 'MANAGER' ? paths.manager.attendance : paths.employee.attendance;
  const breadcrumbs = [{ label: 'Attendance', href: attendancePath }];

  return (
    <Page title="Attendance">
      <PageHeader title="Attendance Check-In" breadcrumbs={breadcrumbs} />
      <EmployeeCheckIn />
    </Page>
  );
}
