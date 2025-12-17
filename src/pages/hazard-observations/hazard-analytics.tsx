import { useHazardAnalytics } from '@/api/resources/hazard-observations';
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
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconFileAlert,
} from '@tabler/icons-react';

export function HazardAnalytics() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useHazardAnalytics();

  // Only show analytics for managers and HSE employees
  if (user?.role !== 'MANAGER' && user?.department !== 'HSE') {
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

  // Prepare data for hazard types bar chart
  const hazardTypesData = Object.entries(analytics.hazard_types_distribution || {})
    .map(([name, value]) => ({
      hazard: name.replace('_', ' '),
      count: value as number,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Prepare data for monthly trend
  const monthlyData = (analytics.monthly_trend || []).map((item: any) => ({
    month: item.month || 'N/A',
    observations: item.count || 0,
  }));

  const stats = [
    {
      title: 'Total Observations',
      value: analytics.total_observations || 0,
      icon: IconFileAlert,
      color: 'blue',
    },
    {
      title: 'Open',
      value: analytics.status_breakdown?.open || 0,
      icon: IconAlertTriangle,
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
  const total = analytics.total_observations || 0;
  const resolved = analytics.status_breakdown?.resolved || 0;
  const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0.0';

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

        {/* Hazard Types Bar Chart */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card padding="lg" radius="md" withBorder h="100%">
            <Stack gap="md">
              <Title order={4}>Top Hazard Types</Title>
              {hazardTypesData.length > 0 ? (
                <BarChart
                  h={280}
                  data={hazardTypesData}
                  dataKey="hazard"
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
              <Title order={4}>Observations Trend (Last 6 Months)</Title>
              {monthlyData.length > 0 ? (
                <LineChart
                  h={300}
                  data={monthlyData}
                  dataKey="month"
                  series={[{ name: 'observations', color: 'blue.6', label: 'Observations' }]}
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

        {/* Top Facilities */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card padding="lg" radius="md" withBorder h="100%">
            <Stack gap="md">
              <Title order={4}>Top Facilities</Title>
              <Stack gap="sm">
                {(analytics.top_facilities || []).slice(0, 5).map((facility: any, index: number) => (
                  <Group
                    key={index}
                    justify="space-between"
                    p="xs"
                    style={{
                      borderLeft: '3px solid var(--mantine-color-red-6)',
                      backgroundColor: 'var(--mantine-color-gray-0)',
                    }}
                  >
                    <Text size="sm" fw={500} style={{ flex: 1 }} truncate>
                      {facility.facility_name || facility.facility_id}
                    </Text>
                    <Text size="sm" fw={700} c="red">
                      {facility.count}
                    </Text>
                  </Group>
                ))}
                {(!analytics.top_facilities || analytics.top_facilities.length === 0) && (
                  <Text size="sm" c="dimmed" ta="center">
                    No data available
                  </Text>
                )}
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
