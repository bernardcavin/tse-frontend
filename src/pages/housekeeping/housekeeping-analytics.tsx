import { IconBuilding, IconClipboardCheck, IconClock } from '@tabler/icons-react';
import { Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { useAuth } from '@/hooks';
import { useHousekeepingAnalytics } from '@/hooks/api/housekeeping';

export function HousekeepingAnalytics() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useHousekeepingAnalytics();

  // Only show analytics for managers
  if (user?.role !== 'MANAGER') {
    return null;
  }

  if (isLoading || !analytics) {
    return null;
  }

  const stats = [
    {
      title: 'Total Checklists',
      value: analytics.total_checklists || 0,
      icon: IconClipboardCheck,
      color: 'blue',
    },
    {
      title: 'Last 30 Days',
      value: analytics.recent_checklists_30_days || 0,
      icon: IconClock,
      color: 'green',
    },
    {
      title: 'Facilities Inspected',
      value: analytics.checklists_by_facility?.length || 0,
      icon: IconBuilding,
      color: 'violet',
    },
  ];

  return (
    <Stack gap="lg" mb="lg">
      {/* Key Metrics */}
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
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
    </Stack>
  );
}
