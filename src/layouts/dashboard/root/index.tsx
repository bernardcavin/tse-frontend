import { useAuth } from '@/hooks';
import { useNavbar } from '@/providers/navbar-provider';
import {
    ActionIcon,
    AppShell,
    Divider,
    Modal,
    SimpleGrid,
    Stack,
    Text,
    UnstyledButton,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { ArrowLeft2 } from 'iconsax-react';
import { Suspense, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppHeader from '../header';
import Navbar from '../sidebar';
import { getMenusForRole, SideLink } from '../sidebar/menu';
import classes from './root.module.css';

export function DashboardLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const { isNavbarCollapse } = useNavbar();
  const { user } = useAuth();
  const navigate = useNavigate();

  const smallScreen = useMediaQuery('(max-width: 48em)');
  const menus = getMenusForRole(user?.role ?? '', user?.department);

  // Track which menu's submenus are being shown
  const [activeSubmenu, setActiveSubmenu] = useState<SideLink | null>(null);

  const handleMenuClick = (menu: SideLink) => {
    if (menu.subs && menu.subs.length > 0) {
      // Has submenus, show them
      setActiveSubmenu(menu);
    } else {
      // No submenus, navigate directly
      navigate(menu.href);
      handleClose();
    }
  };

  const handleSubMenuClick = (href: string) => {
    navigate(href);
    handleClose();
  };

  const handleClose = () => {
    close();
    setActiveSubmenu(null);
  };

  const handleBack = () => {
    setActiveSubmenu(null);
  };

  return (
    <>
      {/* Mobile Centered Modal */}
      <Modal
        opened={smallScreen ? opened : false}
        onClose={handleClose}
        centered
        size="sm"
        radius="lg"
        withCloseButton={false}
        overlayProps={{ opacity: 0.6, blur: 8 }}
        transitionProps={{ duration: 200, transition: 'pop' }}
        classNames={{
          content: classes.modalContent,
          body: classes.modalBody,
        }}
      >
        <Stack gap="md" p="md">
          {activeSubmenu ? (
            // Submenu View
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={handleBack}
                  radius="xl"
                >
                  <ArrowLeft2 size={20} />
                </ActionIcon>
                <Text fw={600} size="lg" c="blue.9">
                  {activeSubmenu.title}
                </Text>
              </div>
              <Divider />
              <SimpleGrid cols={2} spacing="md">
                {activeSubmenu.subs?.map(({ icon: Icon, href, title, description }) => (
                  <UnstyledButton
                    key={href}
                    onClick={() => handleSubMenuClick(href)}
                    className={classes.mobileNavButton}
                  >
                    <Icon size={28} variant="Bulk" color="var(--mantine-color-blue-7)" />
                    <Text size="xs" ta="center" mt={4} c="blue.9" fw={500} lineClamp={2}>
                      {title}
                    </Text>
                    {description && (
                      <Text size="xs" ta="center" c="dimmed" lineClamp={2}>
                        {description}
                      </Text>
                    )}
                  </UnstyledButton>
                ))}
              </SimpleGrid>
            </>
          ) : (
            // Main Menu View
            <>
              <Text ta="center" fw={600} size="lg" c="blue.9">
                Navigation
              </Text>
              <SimpleGrid cols={3} spacing="md">
                {menus.map((menu) => {
                  const Icon = menu.icon;
                  const hasSubs = menu.subs && menu.subs.length > 0;
                  return (
                    <UnstyledButton
                      key={menu.href}
                      onClick={() => handleMenuClick(menu)}
                      className={classes.mobileNavButton}
                      data-has-subs={hasSubs}
                    >
                      <Icon size={28} variant="Bulk" color="var(--mantine-color-blue-7)" />
                      <Text size="xs" ta="center" mt={4} c="blue.9" fw={500} lineClamp={2}>
                        {menu.title}
                      </Text>
                      {hasSubs && (
                        <Text size="xs" c="dimmed">
                          ›
                        </Text>
                      )}
                    </UnstyledButton>
                  );
                })}
              </SimpleGrid>
            </>
          )}
        </Stack>
      </Modal>

      <AppShell
        padding="md"
        transitionDuration={0}
        navbar={{
          width: isNavbarCollapse ? 298 : 81,
          breakpoint: 'sm',
          collapsed: { mobile: true, desktop: false },
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
    </>
  );
}
