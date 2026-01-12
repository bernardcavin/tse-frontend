import { Logo } from '@/components/logo';
import { Center, Stack } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import classes from './auth.module.css';

export function AuthLayout() {
  return (
    <Center flex={1} h="100%" className={classes.root}>
      <Stack align="center" gap={0}>
        <Logo size={80} />
        <Outlet />
      </Stack>
    </Center>
  );
}
