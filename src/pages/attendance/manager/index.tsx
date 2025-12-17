import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { paths } from '@/routes';
import { Stack } from '@mantine/core';
import { AttendanceLocationsTable } from '../attendance-locations-table';
import { AttendanceRecordsTable } from '../attendance-records-table';

export default function ManagerAttendancePage() {
  const { user } = useAuth();

  const attendancePath =
    user?.role === 'MANAGER' ? paths.manager.attendance : paths.employee.attendance;
  const breadcrumbs = [{ label: 'Attendance', href: attendancePath }, { label: 'Management' }];

  return (
    <Page title="Attendance Management">
      <PageHeader title="Attendance Management" breadcrumbs={breadcrumbs} />

      <Stack gap="lg">
        <AttendanceLocationsTable />
        <AttendanceRecordsTable />
      </Stack>
    </Page>
  );
}
