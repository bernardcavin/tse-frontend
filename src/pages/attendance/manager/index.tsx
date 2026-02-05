import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { paths } from '@/routes';
import { Tabs } from '@mantine/core';
import { IconBuilding, IconChecklist, IconFileDescription, IconUserCheck } from '@tabler/icons-react';
import { AttendanceLocationsTable } from '../attendance-locations-table';
import { AttendanceRecordsTable } from '../attendance-records-table';
import { EmployeeCheckIn } from '../employee/employee-check-in';
import { LeaveRequestsTable } from '../leave-management/leave-requests-table';

export default function ManagerAttendancePage() {
  const { user } = useAuth();

  const attendancePath =
    user?.role === 'MANAGER' ? paths.manager.attendance : paths.employee.attendance;
  const breadcrumbs = [{ label: 'Attendance', href: attendancePath }, { label: 'Management' }];

  return (
    <Page title="Attendance Management">
      <PageHeader title="Attendance Management" breadcrumbs={breadcrumbs} />

      <Tabs defaultValue="check-in">
        <Tabs.List mb="md">
            <Tabs.Tab value="check-in" leftSection={<IconUserCheck size={16} />}>
                My Check-In
            </Tabs.Tab>
            <Tabs.Tab value="locations" leftSection={<IconBuilding size={16} />}>
                Locations
            </Tabs.Tab>
            <Tabs.Tab value="records" leftSection={<IconChecklist size={16} />}>
                All Records
            </Tabs.Tab>
            <Tabs.Tab value="leaves" leftSection={<IconFileDescription size={16} />}>
                Leave Requests
            </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="check-in">
            <EmployeeCheckIn />
        </Tabs.Panel>
        
        <Tabs.Panel value="locations">
            <AttendanceLocationsTable />
        </Tabs.Panel>
        
        <Tabs.Panel value="records">
            <AttendanceRecordsTable />
        </Tabs.Panel>
        
        <Tabs.Panel value="leaves">
            <LeaveRequestsTable />
        </Tabs.Panel>
      </Tabs>
    </Page>
  );
}
