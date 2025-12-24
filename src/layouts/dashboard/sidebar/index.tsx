import { useAuth } from '@/hooks';
import useCurrentNav from '@/hooks/use-current-nav';
import { getMenusForRole } from '@/layouts/dashboard/sidebar/menu';
import SubNavBar from '@/layouts/dashboard/sidebar/sub-navbar';
import { useNavbar } from '@/providers/navbar-provider';
import { Box, Flex, SimpleGrid, Tooltip, useMantineTheme } from '@mantine/core';
import { useHover, useMediaQuery } from '@mantine/hooks';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classes from './navbar.module.css';

interface NavbarProps {
  onNavigate?: () => void;
}

export default function Navbar({ onNavigate }: NavbarProps = {}) {
  const theme = useMantineTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const smallScreen = useMediaQuery('(max-width: 48em)');
  const { isNavbarCollapse, openNavbar, closeNavbar, isNavbarLocked } = useNavbar();

  const [currentAppTitle, setCurrentAppTitle] = useState<string>('');

  const currentNav = useCurrentNav();
  const { pathname } = useLocation();

  const { hovered, ref } = useHover();

  // Filter menus based on user role - will re-compute when user.role changes
  const visibleMenus = useMemo(() => {
    console.log('[Sidebar] Computing visible menus for role:', user?.role);
    const menus = getMenusForRole(user?.role ?? '', user?.department);
    console.log('[Sidebar] Visible menus count:', menus.length, menus.map(m => m.label));
    return menus;
  }, [user?.role]);

  useEffect(() => {
    if (currentNav) {
      setCurrentAppTitle(currentNav.title);
    }
  }, [currentNav]);

  useEffect(() => {
    smallScreen && closeNavbar();
  }, [smallScreen, closeNavbar]);

  const currentHoveredNav = visibleMenus.find((link) => link.title === currentAppTitle);

  useEffect(() => {
    if (isNavbarLocked) {
      return;
    }
    if (hovered && currentHoveredNav?.subs && currentHoveredNav.subs.length > 1) {
      openNavbar();
    } else {
      closeNavbar();
    }
  }, [hovered, currentHoveredNav, isNavbarLocked, openNavbar, closeNavbar]);

  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <Flex className={classes.root} ref={ref}>
      <Flex
        direction="column"
        align="center"
        justify="space-between"
        // p="sm"
        h="100%"
        className={classes.mini_container}
        // bg="blue.9"
      >
        <Flex
          direction="column"
          align="center"
          justify="space-between"
          p="sm"
          h="100%"
          className={classes.mini_container}
          // bg="blue.9"
        >
          {/* Top links */}
          <Flex w="100%" direction="column" align="center" gap={10}>
            <SimpleGrid pb={10} className={classes.mini_link_item_container} cols={1} w="100%">
              {visibleMenus.map(({ icon: Icon, href, title, subs }) => {
                const isHovered = hoveredLink === title;
                const isActive = currentNav?.href.includes(href);

                const icon = (
                  <Icon
                    color={
                      isActive && isHovered
                        ? theme.colors.blue[7]
                        : isActive
                          ? theme.colors.blue[7]
                          : isHovered
                            ? theme.colors.blue[9]
                            : theme.colors.blue[2]
                    }
                    variant="Bulk"
                    size={30}
                  />
                );

                return (
                  <Tooltip label={title} key={href} position="right">
                    <Box
                      key={href}
                      onMouseEnter={() => setHoveredLink(title)}
                      onMouseLeave={() => setHoveredLink(null)}
                      onClick={() => {
                        if (isNavbarLocked) {
                          setCurrentAppTitle(title);
                          if (smallScreen && !isNavbarCollapse && subs && subs.length > 0) {
                            openNavbar();
                          }
                        } else {
                          navigate(href);
                          onNavigate?.();
                        }
                      }}
                      data-active={isActive}
                      className={classes.mini_link}
                    >
                      {icon}
                    </Box>
                  </Tooltip>
                );
              })}
            </SimpleGrid>
          </Flex>
        </Flex>
      </Flex>

      <SubNavBar appTitle={currentAppTitle} isNavbarOpen={isNavbarCollapse} onNavigate={onNavigate} />
    </Flex>
  );
}
