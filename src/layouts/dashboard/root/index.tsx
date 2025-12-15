import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell, useMantineColorScheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useNavbar } from '@/providers/navbar-provider';
import AppHeader from '../header';
import Navbar from '../sidebar';
import classes from './root.module.css';

export function DashboardLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { isNavbarCollapse } = useNavbar();

  const smallScreen = useMediaQuery('(max-width: 48em)');

  return (
    <AppShell
      padding="md"
      transitionDuration={0}
      navbar={{
        width: isNavbarCollapse ? 298 : 81,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      classNames={{
        navbar: classes.navbar,
        header: classes.header,
        main: classes.main,
      }}
      header={{ height: 60 }}
    >
      <AppShell.Header>
        <AppHeader opened={opened} toggle={toggle} />
      </AppShell.Header>
      <AppShell.Navbar data-smallscreen={smallScreen} data-collapse={isNavbarCollapse}>
        <Navbar />
      </AppShell.Navbar>
      <AppShell.Main>
        <Suspense fallback={<div>Loading</div>}>
          <Outlet />
        </Suspense>
      </AppShell.Main>
    </AppShell>
  );
}
