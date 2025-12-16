import { ColorSchemeToggler } from '@/components/color-scheme-toggler';
import { SpotlightSearchBarButton } from '@/components/spotlight-search-bar-button';
import { useAuth } from '@/hooks';
import { CurrentUser } from '@/layouts/dashboard/header/current-user';
import { SearchMenu } from '@/layouts/dashboard/header/search-menu';
import { getMenusForRole } from '@/layouts/dashboard/sidebar/menu';
import { useNavbar } from '@/providers/navbar-provider';
import { Burger, Flex, Group } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

interface Props {
  opened: boolean;
  toggle: () => void;
}

export default function AppHeader({ opened, toggle }: Props) {
  const { isNavbarCollapse, toggleNavbar, lockNavbar, unlockNavbar } = useNavbar();
  const { user } = useAuth();

  const smallScreen = useMediaQuery('(max-width: 48em)');
  const menus = getMenusForRole(user?.role ?? '');

  const handleClick = () => {
    if (isNavbarCollapse) {
      unlockNavbar();
    } else {
      lockNavbar();
    }
    toggleNavbar();
  };

  return (
    <Group h="100%" px="md" justify="space-between">
      <Flex align="center" gap={16}>
        {smallScreen ? (
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        ) : (
          <Burger
            style={{
              outline: 'none',
            }}
            size="sm"
            opened={isNavbarCollapse}
            onClick={handleClick}
          />
        )}
        <SpotlightSearchBarButton
          placeholder="Search for feature"
          spotlight={<SearchMenu menus={menus} />}
        />

        {/* <Logo withLabel variant="filled" /> */}
        {/* <Version /> */}
        {/* <Anchor href="" target="_blank" c="dimmed">
          Documentation
        </Anchor> */}
      </Flex>

      <Flex align="center" gap="md">
        {/* <FullScreen />

        <ThemeSwitch /> */}

        <ColorSchemeToggler />

        <CurrentUser />

        {/* <ColorSchemeToggler /> */}

        {/* <LogoutButton /> */}
      </Flex>
    </Group>
  );
}
