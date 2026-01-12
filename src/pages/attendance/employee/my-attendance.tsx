import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { paths } from '@/routes';
import { AttendanceRecordsTable } from '../attendance-records-table';

export default function MyAttendancePage() {
  const { user } = useAuth();

  const breadcrumbs = [
    { label: 'Attendance', href: paths.employee.attendance },
    { label: 'My History', href: paths.employee.attendanceHistory },
  ];

  return (
    <Page title="My Attendance History">
      <PageHeader title="My Attendance History" breadcrumbs={breadcrumbs} />
      <AttendanceRecordsTable userId={user?.id} />
    </Page>
  );
}
