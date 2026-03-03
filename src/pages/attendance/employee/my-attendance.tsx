import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { paths } from '@/routes';
import { Stack, Tabs } from '@mantine/core';
import { IconFileDescription, IconHistory } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AttendanceRecordsTable } from '../attendance-records-table';
import { LeaveRequestsTable } from '../leave-management/leave-requests-table';
import { WebcamAttendance } from './webcam-attendance';

export default function MyAttendancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: 'Attendance', href: paths.employee.attendance },
    { label: 'My History', href: paths.employee.attendanceHistory },
  ];

  return (
    <Page title="My Attendance History">
      <PageHeader title="My Attendance History" breadcrumbs={breadcrumbs} />
      
      <Stack gap="xl">
        <WebcamAttendance />

        <Tabs defaultValue="history">
          <Tabs.List mb="md">
              <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>
                  Attendance History
              </Tabs.Tab>
              <Tabs.Tab value="leaves" leftSection={<IconFileDescription size={16} />}>
                  Leave Requests
              </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="history">
              <AttendanceRecordsTable userId={user?.id} />
          </Tabs.Panel>

          <Tabs.Panel value="leaves">
              <LeaveRequestsTable />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Page>
  );
}
