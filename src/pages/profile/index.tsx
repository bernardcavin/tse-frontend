import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { paths } from '@/routes/paths';
import { Badge, Card, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { ProfileForm } from './profile-form';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const profilePath = user.role === 'MANAGER' ? paths.manager.profile : paths.employee.profile;
  const breadcrumbs = [{ label: 'Profile', href: profilePath }];

  return (
    <Page title="Profile">
      <PageHeader title="My Profile" breadcrumbs={breadcrumbs} />

      <Stack gap="xl">
        {/* Read-Only Employment Information */}
        <Paper p="md" withBorder>
          <Group justify="space-between" align="center" mb="md">
            <Title order={4}>Employment Information</Title>
            <Badge size="lg" variant="light" color={user.role === 'MANAGER' ? 'blue' : 'green'}>
              {user.role}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed" mb="lg">
            The following information can only be changed by a manager
          </Text>
          
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500} c="dimmed">Position</Text>
                <Text>{user.position || 'N/A'}</Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500} c="dimmed">Department</Text>
                <Text>{user.department || 'N/A'}</Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500} c="dimmed">Employee Number</Text>
                <Text>{user.employee_num || 'N/A'}</Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Stack gap="xs">
                <Text size="sm" fw={500} c="dimmed">Hire Date</Text>
                <Text>{formatDate(user.hire_date?.toString())}</Text>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Editable Profile Form */}
        <Card withBorder>
          <Title order={4} mb="md">Update Personal Information</Title>
          <ProfileForm />
        </Card>
      </Stack>
    </Page>
  );
}

