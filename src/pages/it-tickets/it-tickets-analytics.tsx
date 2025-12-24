import { useITTicketAnalytics } from '@/api/resources/it-tickets';
import { useAuth } from '@/hooks';
import { BarChart, LineChart, PieChart } from '@mantine/charts';
import {
    Card,
    Center,
    Grid,
    Group,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import {
    IconCheck,
    IconClock,
    IconTicket,
    IconUrgent,
} from '@tabler/icons-react';

export function ITTicketAnalytics() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useITTicketAnalytics();

  // Only show analytics for managers and IT employees
  if (user?.role !== 'MANAGER' && user?.department !== 'IT') {
    return null;
  }

  if (isLoading || !analytics) {
    return null;
  }

  // Prepare data for status pie chart
  const statusData = Object.entries(analytics.status_breakdown || {})
    .map(([name, value]) => ({
      name: name.replace('_', ' ').toUpperCase(),
      value: value as number,
      color: name === 'open' ? 'red.6' : name === 'in_progress' ? 'yellow.6' : name === 'resolved' ? 'green.6' : 'gray.6',
    }))
    .filter((item) => item.value > 0);

  // Prepare data for category bar chart
  const categoryData = Object.entries(analytics.category_breakdown || {})
    .map(([name, value]) => ({
      category: name.replace('_', ' '),
      count: value as number,
    }))
    .sort((a, b) => b.count - a.count);

  // Prepare data for monthly trend
  const monthlyData = (analytics.monthly_trend || []).map((item: any) => ({
    month: item.month || 'N/A',
    tickets: item.count || 0,
  }));

  // Prepare data for priority breakdown
  const priorityData = Object.entries(analytics.priority_breakdown || {})
    .map(([name, value]) => ({
      name: name.toUpperCase(),
      value: value as number,
      color: name === 'critical' ? 'red.6' : name === 'high' ? 'orange.6' : name === 'medium' ? 'yellow.6' : 'gray.6',
    }))
    .filter((item) => item.value > 0);

  const stats = [
    {
      title: 'Total Tickets',
      value: analytics.total_tickets || 0,
      icon: IconTicket,
      color: 'blue',
    },
    {
      title: 'Open',
      value: analytics.status_breakdown?.open || 0,
      icon: IconUrgent,
      color: 'red',
    },
    {
      title: 'In Progress',
      value: analytics.status_breakdown?.in_progress || 0,
      icon: IconClock,
      color: 'yellow',
    },
    {
      title: 'Resolved',
      value: analytics.status_breakdown?.resolved || 0,
      icon: IconCheck,
      color: 'green',
    },
  ];

  // Calculate resolution rate
  const total = analytics.total_tickets || 0;
  const resolved = analytics.status_breakdown?.resolved || 0;
  const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0.0';
  const avgResolutionHours = analytics.avg_resolution_hours || 0;

  return (
    <Stack gap="lg" mb="lg">
      {/* Key Metrics */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} padding="md" radius="md" withBorder>
              <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="xs" c="dimmed" fw={500}>
                    {stat.title}
                  </Text>
                  <Text size="xl" fw={700}>
                    {stat.value}
                  </Text>
                </Stack>
                <Icon size={32} stroke={1.5} color={`var(--mantine-color-${stat.color}-6)`} />
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Charts */}
      <Grid>
        {/* Status Distribution Pie Chart */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card padding="lg" radius="md" withBorder h="100%">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={4}>Status Distribution</Title>
                <Text size="sm" c="dimmed">
                  Resolution Rate: {resolutionRate}%
                </Text>
              </Group>
              <Center>
                {statusData.length > 0 ? (
                <PieChart

                  data={statusData}
                  withLabelsLine labelsPosition="outside" labelsType="value" withLabels withTooltip
                  tooltipDataSource="segment"
                />
              ) : (
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  No data available
                </Text>
              )}
              </Center>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Category Bar Chart */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card padding="lg" radius="md" withBorder h="100%">
            <Stack gap="md">
              <Title order={4}>Tickets by Category</Title>
              {categoryData.length > 0 ? (
                <BarChart
                  h={280}
                  data={categoryData}
                  dataKey="category"
                  series={[{ name: 'count', color: 'blue.6', label: 'Count' }]}
                  tickLine="y"
                  gridAxis="y"
                  withTooltip
                  withLegend
                  tooltipAnimationDuration={200}
                  xAxisProps={{ angle: -45, textAnchor: 'end', height: 100 }}
                />
              ) : (
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  No data available
                </Text>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Monthly Trend Line Chart */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Title order={4}>Tickets Trend (Last 6 Months)</Title>
              {monthlyData.length > 0 ? (
                <LineChart
                  h={300}
                  data={monthlyData}
                  dataKey="month"
                  series={[{ name: 'tickets', color: 'blue.6', label: 'Tickets' }]}
                  curveType="linear"
                  withTooltip
                  withLegend
                  tooltipAnimationDuration={200}
                  connectNulls
                  withDots
                  gridAxis="xy"
                />
              ) : (
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  No data available
                </Text>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Priority Breakdown & Stats */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card padding="lg" radius="md" withBorder h="100%">
            <Stack gap="md">
              <Title order={4}>Priority Distribution</Title>
              <Center>
                {priorityData.length > 0 ? (
                  <PieChart
                    data={priorityData}
                    withLabelsLine labelsPosition="outside" labelsType="value" withLabels withTooltip
                    tooltipDataSource="segment"
                  />
                ) : (
                  <Text size="sm" c="dimmed" ta="center" py="xl">
                    No data available
                  </Text>
                )}
              </Center>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Avg. Resolution Time</Text>
                  <Text size="sm" fw={600}>{avgResolutionHours} hours</Text>
                </Group>
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
