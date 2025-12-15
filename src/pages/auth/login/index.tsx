import { PiGoogleLogoDuotone as GoogleIcon, PiXLogoDuotone as XIcon } from 'react-icons/pi';
import { NavLink } from 'react-router-dom';
import { Anchor, Button, Center, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { Page } from '@/components/page';
import { UnderlineShape } from '@/components/underline-shape';
import { Version } from '@/layouts/dashboard/header/version';
import { paths } from '@/routes';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <Page title="Login">
      <Stack align="center" gap="sm">
        <Title order={2} fw={300}>
          Welcome!
        </Title>

        <Text fz="sm" c="dimmed">
          Please Login with a registered account.
        </Text>

        <Paper withBorder radius="md" p="md" h="100%" w={350}>
          <Stack gap="lg">
            <LoginForm />
          </Stack>
        </Paper>

        <Version />
      </Stack>
    </Page>
  );
}
