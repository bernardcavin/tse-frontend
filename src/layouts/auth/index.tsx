import { Outlet } from 'react-router-dom';
import { Center, Stack } from '@mantine/core';
import { Logo } from '@/components/logo';
import classes from './auth.module.css';

export function AuthLayout() {
  return (
    <Center flex={1} h="100%" className={classes.root}>
      <Stack align="center" gap={0}>
        <Logo size={50} />
        <Outlet />
      </Stack>
    </Center>
  );
}
