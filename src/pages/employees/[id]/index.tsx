import { useHazardObservations } from '@/api/resources/hazard-observations';
import { useITTickets } from '@/api/resources/it-tickets';
import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useGetAttendanceRecords } from '@/hooks/api/attendance';
import { useGetEmployees } from '@/hooks/api/employees';
import { openHazardObservationView } from '@/pages/hazard-observations/hazard-observations-modals';
import { paths } from '@/routes';
import {
    Badge,
    Button,
    Card,
    Grid,
    Group,
    Loader,
    SimpleGrid,
    Stack,
    Tabs,
    Text,
    Title
} from '@mantine/core';
import { DatePickerInput, DateValue } from '@mantine/dates';
import {
    IconCalendar,
    IconClipboardList,
    IconEye,
    IconFileAlert,
    IconTicket,
    IconUser,
    IconX
} from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  // Date filters state
  const [attendanceDateRange, setAttendanceDateRange] = useState<[DateValue, DateValue]>([null, null]);
  const [hocDateRange, setHocDateRange] = useState<[DateValue, DateValue]>([null, null]);
  const [ticketDateRange, setTicketDateRange] = useState<[DateValue, DateValue]>([null, null]);
  
  // Pagination state
  const [attendancePage, setAttendancePage] = useState(1);
  const [hocPage, setHocPage] = useState(1);
  const [ticketPage, setTicketPage] = useState(1);
  const PAGE_SIZE = 10;
  
  // Fetch all employees and find the specific one
  const { data: employees, isLoading: employeeLoading } = useGetEmployees();
  const employee = useMemo(() => {
    return employees?.find(emp => emp.id === id);
  }, [employees, id]);
  
  // Fetch attendance records for this employee with date filters
  const { data: attendanceData, isLoading: attendanceLoading } = useGetAttendanceRecords({query: {
    user_id: id,
    start_date: attendanceDateRange[0] ? attendanceDateRange[0].toString() : undefined,
    end_date: attendanceDateRange[1] ? attendanceDateRange[1].toString() : undefined,
  }});
  
  // Fetch hazard observations for this employee
  const { data: hazardData, isLoading: hazardLoading } = useHazardObservations();

  // Fetch IT tickets
  const { data: ticketData, isLoading: ticketLoading } = useITTickets();

  // Filter hazard observations by observer_id and date range on frontend
  const employeeHazards = useMemo(() => {
    if (!hazardData?.data) return [];
    let filtered = hazardData.data.filter((obs: any) => obs.observer_id === id);
    
    // Apply date filters if set
    if (hocDateRange[0]) {
      filtered = filtered.filter((obs: any) => 
        new Date(obs.observation_date) >= hocDateRange[0]!
      );
    }
    if (hocDateRange[1]) {
      filtered = filtered.filter((obs: any) => 
        new Date(obs.observation_date) <= hocDateRange[1]!
      );
    }
    
    return filtered;
  }, [hazardData, id, hocDateRange]);

  // Filter IT tickets by reporter_id and date range on frontend
  const employeeTickets = useMemo(() => {
    if (!ticketData?.data) return [];
    let filtered = ticketData.data.filter((ticket: any) => ticket.reporter_id === id);
    
    // Apply date filters if set
    if (ticketDateRange[0]) {
      filtered = filtered.filter((ticket: any) => 
        new Date(ticket.created_at) >= ticketDateRange[0]!
      );
    }
    if (ticketDateRange[1]) {
      filtered = filtered.filter((ticket: any) => 
        new Date(ticket.created_at) <= ticketDateRange[1]!
      );
    }
    
    return filtered;
  }, [ticketData, id, ticketDateRange]);

  if (employeeLoading || !employee) {
    return (
      <Page title="Employee Details">
        <Group justify="center" py="xl">
          <Loader size="lg" />
        </Group>
      </Page>
    );
  }

  const breadcrumbs = [
    { label: 'Employees', href: paths.manager.employees },
    { label: employee.name || 'Employee Details', href: paths.manager.employeeDetail(id!) },
  ];

  // Helper function to calculate duration
  const calculateDuration = (checkIn: Date, checkOut: Date | null): string => {
    if (!checkOut) return '-';
    const diff = checkOut.getTime() - checkIn.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Calculate total duration for filtered attendance records
  const totalDuration = useMemo(() => {
    if (!attendanceData?.data) return { hours: 0, minutes: 0 };
    let totalMs = 0;
    attendanceData.data.forEach((record: any) => {
      if (record.check_out_time) {
        const diff = new Date(record.check_out_time).getTime() - 
                    new Date(record.check_in_time).getTime();
        totalMs += diff;
      }
    });
    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  }, [attendanceData]);

  // Calculate statistics
  const totalAttendanceDays = attendanceData?.data?.length || 0;
  const totalHOCs = employeeHazards.length;
  const openHOCs = employeeHazards.filter((h: any) => h.status === 'open').length;
  const resolvedHOCs = employeeHazards.filter((h: any) => h.status === 'resolved').length;

  const totalTickets = employeeTickets.length;
  const openTickets = employeeTickets.filter((t: any) => t.status === 'open').length;
  const inProgressTickets = employeeTickets.filter((t: any) => t.status === 'in_progress').length;
  const resolvedTickets = employeeTickets.filter((t: any) => t.status === 'resolved' || t.status === 'closed').length;

  // Attendance columns
  const attendanceColumns = [
    {
      accessor: 'check_in_time' as const,
      title: 'Date',
      render: (record: any) => new Date(record.check_in_time).toLocaleDateString(),
    },
    {
      accessor: 'check_in_time' as const,
      title: 'Check In',
      render: (record: any) => new Date(record.check_in_time).toLocaleTimeString(),
    },
    {
      accessor: 'check_out_time' as const,
      title: 'Check Out',
      render: (record: any) => record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : '-',
    },
    {
      accessor: 'duration' as const,
      title: 'Duration',
      render: (record: any) => calculateDuration(
        new Date(record.check_in_time),
        record.check_out_time ? new Date(record.check_out_time) : null
      ),
    },
    {
      accessor: 'location_name' as const,
      title: 'Location',
      render: (record: any) => record.location_name || '-',
    },
  ];

  // Hazard observations columns
  const hazardColumns = [
    {
      accessor: 'observation_date' as const,
      title: 'Date',
      render: (record: any) => new Date(record.observation_date).toLocaleDateString(),
    },
    {
      accessor: 'facility_name' as const,
      title: 'Facility',
      render: (record: any) => record.facility_name || record.facility_id,
    },
    {
      accessor: 'unsafe_action_condition' as const,
      title: 'Description',
      ellipsis: true,
    },
    {
      accessor: 'status' as const,
      title: 'Status',
      render: (record: any) => (
        <Badge
          color={
            record.status === 'open' ? 'red' :
            record.status === 'in_progress' ? 'yellow' :
            record.status === 'resolved' ? 'green' : 'gray'
          }
        >
          {record.status?.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      accessor: 'actions' as const,
      title: 'Actions',
      width: 100,
      render: (record: any) => (
        <Button
          size="xs"
          variant="subtle"
          leftSection={<IconEye size={14} />}
          onClick={() => openHazardObservationView(record.id)}
        >
          View
        </Button>
      ),
    },
  ];

  // IT Tickets columns
  const ticketColumns = [
    {
      accessor: 'created_at' as const,
      title: 'Date',
      render: (record: any) => new Date(record.created_at).toLocaleDateString(),
    },
    {
      accessor: 'title' as const,
      title: 'Title',
      ellipsis: true,
    },
    {
      accessor: 'category' as const,
      title: 'Category',
      render: (record: any) => record.category?.replace('_', ' ').toUpperCase(),
    },
    {
      accessor: 'priority' as const,
      title: 'Priority',
      render: (record: any) => (
        <Badge
          color={
            record.priority === 'critical' ? 'red' :
            record.priority === 'high' ? 'orange' :
            record.priority === 'medium' ? 'yellow' : 'blue'
          }
        >
          {record.priority?.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessor: 'status' as const,
      title: 'Status',
      render: (record: any) => (
        <Badge
          color={
            record.status === 'open' ? 'red' :
            record.status === 'in_progress' ? 'yellow' :
            record.status === 'resolved' || record.status === 'closed' ? 'green' : 'gray'
          }
        >
          {record.status?.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      accessor: 'assigned_to_name' as const,
      title: 'Assigned To',
      render: (record: any) => record.assigned_to_name || '-',
    },
  ];

  return (
    <Page title={`Employee: ${employee.name}`}>
      <PageHeader title={employee.name || 'Employee Details'} breadcrumbs={breadcrumbs} />

      <Stack gap="lg">
        {/* Employee Info Card - Enhanced */}
        <Card padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group>
              <IconUser size={24} />
              <Title order={3}>Employee Information</Title>
            </Group>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">Name</Text>
                <Text fw={500}>{employee.name || '-'}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">Username</Text>
                <Text fw={500}>{employee.username || '-'}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">Employee Number</Text>
                <Text fw={500}>{employee.employee_num || '-'}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">NIK</Text>
                <Text fw={500}>{employee.nik || '-'}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">Email</Text>
                <Text fw={500}>{employee.email || '-'}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">Phone Number</Text>
                <Text fw={500}>{employee.phone_number || '-'}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">Department</Text>
                <Text fw={500}>{employee.department || '-'}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">Position</Text>
                <Text fw={500}>{employee.position || '-'}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">Hire Date</Text>
                <Text fw={500}>
                  {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '-'}
                </Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">Address</Text>
                <Text fw={500}>{employee.address || '-'}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">Emergency Contact</Text>
                <Text fw={500}>{employee.emergency_contact_name || '-'}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">Emergency Phone</Text>
                <Text fw={500}>{employee.emergency_contact_phone || '-'}</Text>
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* Tabbed Interface */}
        <Tabs defaultValue="attendance">
          <Tabs.List>
            <Tabs.Tab value="attendance" leftSection={<IconClipboardList size={16} />}>
              Attendance
            </Tabs.Tab>
            <Tabs.Tab value="hazards" leftSection={<IconFileAlert size={16} />}>
              Hazard Observations
            </Tabs.Tab>
            <Tabs.Tab value="tickets" leftSection={<IconTicket size={16} />}>
              IT Tickets
            </Tabs.Tab>
          </Tabs.List>

          {/* Attendance Tab */}
          <Tabs.Panel value="attendance" pt="lg">
            <Stack gap="lg">
              {/* Attendance Metrics */}
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Card padding="md" radius="md" withBorder>
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed" fw={500}>Total Attendance Days</Text>
                      <Text size="xl" fw={700}>{totalAttendanceDays}</Text>
                    </Stack>
                    <IconCalendar size={32} stroke={1.5} color="var(--mantine-color-blue-6)" />
                  </Group>
                </Card>
                <Card padding="md" radius="md" withBorder>
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed" fw={500}>Total Duration</Text>
                      <Text size="xl" fw={700}>{totalDuration.hours}h {totalDuration.minutes}m</Text>
                    </Stack>
                    <IconCalendar size={32} stroke={1.5} color="var(--mantine-color-cyan-6)" />
                  </Group>
                </Card>
              </SimpleGrid>

              {/* Attendance Records Table */}
              <Card padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Title order={4}>Attendance Records</Title>
                    <Group gap="sm">
                      <DatePickerInput
                        type="range"
                        placeholder="Pick date range"
                        value={attendanceDateRange}
                        onChange={setAttendanceDateRange}
                        clearable
                        size="xs"
                        leftSection={<IconCalendar size={16} />}
                      />
                      {(attendanceDateRange[0] || attendanceDateRange[1]) && (
                        <Button
                          size="xs"
                          variant="subtle"
                          color="gray"
                          onClick={() => setAttendanceDateRange([null, null])}
                          leftSection={<IconX size={14} />}
                        >
                          Clear
                        </Button>
                      )}
                    </Group>
                  </Group>
                  {attendanceLoading ? (
                    <Group justify="center" py="xl">
                      <Loader />
                    </Group>
                  ) : (
                    <DataTable
                      withTableBorder={false}
                      mih={200}
                      columns={attendanceColumns}
                      records={attendanceData?.data || []}
                      totalRecords={attendanceData?.meta?.total || 0}
                      fetching={attendanceLoading}
                      page={attendancePage}
                      onPageChange={setAttendancePage}
                      recordsPerPage={PAGE_SIZE}
                    />
                  )}
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          {/* Hazard Observations Tab */}
          <Tabs.Panel value="hazards" pt="lg">
            <Stack gap="lg">
              {/* Hazard Observation Metrics */}
              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <Card padding="md" radius="md" withBorder>
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed" fw={500}>Total HOCs</Text>
                      <Text size="xl" fw={700}>{totalHOCs}</Text>
                    </Stack>
                    <IconFileAlert size={32} stroke={1.5} color="var(--mantine-color-violet-6)" />
                  </Group>
                </Card>
                <Card padding="md" radius="md" withBorder>
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed" fw={500}>Open HOCs</Text>
                      <Text size="xl" fw={700}>{openHOCs}</Text>
                    </Stack>
                    <IconFileAlert size={32} stroke={1.5} color="var(--mantine-color-red-6)" />
                  </Group>
                </Card>
                <Card padding="md" radius="md" withBorder>
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed" fw={500}>Resolved HOCs</Text>
                      <Text size="xl" fw={700}>{resolvedHOCs}</Text>
                    </Stack>
                    <IconFileAlert size={32} stroke={1.5} color="var(--mantine-color-green-6)" />
                  </Group>
                </Card>
              </SimpleGrid>

              {/* Hazard Observations Table */}
              <Card padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Title order={4}>Hazard Observation Cards</Title>
                    <Group gap="sm">
                      <DatePickerInput
                        type="range"
                        placeholder="Pick date range"
                        value={hocDateRange}
                        onChange={setHocDateRange}
                        clearable
                        size="xs"
                        leftSection={<IconCalendar size={16} />}
                      />
                      {(hocDateRange[0] || hocDateRange[1]) && (
                        <Button
                          size="xs"
                          variant="subtle"
                          color="gray"
                          onClick={() => setHocDateRange([null, null])}
                          leftSection={<IconX size={14} />}
                        >
                          Clear
                        </Button>
                      )}
                    </Group>
                  </Group>
                  {hazardLoading ? (
                    <Group justify="center" py="xl">
                      <Loader />
                    </Group>
                  ) : (
                    <DataTable
                      withTableBorder={false}
                      mih={200}
                      columns={hazardColumns}
                      records={employeeHazards}
                      totalRecords={employeeHazards.length}
                      fetching={hazardLoading}
                      page={hocPage}
                      onPageChange={setHocPage}
                      recordsPerPage={PAGE_SIZE}
                    />
                  )}
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          {/* IT Tickets Tab */}
          <Tabs.Panel value="tickets" pt="lg">
            <Stack gap="lg">
              {/* IT Ticket Metrics */}
              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
                <Card padding="md" radius="md" withBorder>
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed" fw={500}>Total Tickets</Text>
                      <Text size="xl" fw={700}>{totalTickets}</Text>
                    </Stack>
                    <IconTicket size={32} stroke={1.5} color="var(--mantine-color-violet-6)" />
                  </Group>
                </Card>
                <Card padding="md" radius="md" withBorder>
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed" fw={500}>Open Tickets</Text>
                      <Text size="xl" fw={700}>{openTickets}</Text>
                    </Stack>
                    <IconTicket size={32} stroke={1.5} color="var(--mantine-color-red-6)" />
                  </Group>
                </Card>
                <Card padding="md" radius="md" withBorder>
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed" fw={500}>In Progress</Text>
                      <Text size="xl" fw={700}>{inProgressTickets}</Text>
                    </Stack>
                    <IconTicket size={32} stroke={1.5} color="var(--mantine-color-yellow-6)" />
                  </Group>
                </Card>
                <Card padding="md" radius="md" withBorder>
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed" fw={500}>Resolved Tickets</Text>
                      <Text size="xl" fw={700}>{resolvedTickets}</Text>
                    </Stack>
                    <IconTicket size={32} stroke={1.5} color="var(--mantine-color-green-6)" />
                  </Group>
                </Card>
              </SimpleGrid>

              {/* IT Tickets Table */}
              <Card padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Title order={4}>IT Tickets</Title>
                    <Group gap="sm">
                      <DatePickerInput
                        type="range"
                        placeholder="Pick date range"
                        value={ticketDateRange}
                        onChange={setTicketDateRange}
                        clearable
                        size="xs"
                        leftSection={<IconCalendar size={16} />}
                      />
                      {(ticketDateRange[0] || ticketDateRange[1]) && (
                        <Button
                          size="xs"
                          variant="subtle"
                          color="gray"
                          onClick={() => setTicketDateRange([null, null])}
                          leftSection={<IconX size={14} />}
                        >
                          Clear
                        </Button>
                      )}
                    </Group>
                  </Group>
                  {ticketLoading ? (
                    <Group justify="center" py="xl">
                      <Loader />
                    </Group>
                  ) : (
                    <DataTable
                      withTableBorder={false}
                      mih={200}
                      columns={ticketColumns}
                      records={employeeTickets}
                      totalRecords={employeeTickets.length}
                      fetching={ticketLoading}
                      page={ticketPage}
                      onPageChange={setTicketPage}
                      recordsPerPage={PAGE_SIZE}
                    />
                  )}
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Page>
  );
}
