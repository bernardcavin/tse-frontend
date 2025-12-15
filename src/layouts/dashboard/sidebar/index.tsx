import { useEffect, useState } from 'react';
import { Setting3 } from 'iconsax-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Flex, Indicator, SimpleGrid, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { useHover, useMediaQuery } from '@mantine/hooks';
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks';
import useCurrentNav from '@/hooks/use-current-nav';
import { MENUS } from '@/layouts/dashboard/sidebar/menu';
import SubNavBar from '@/layouts/dashboard/sidebar/sub-navbar';
import { useNavbar } from '@/providers/navbar-provider';
import { paths } from '@/routes';
import classes from './navbar.module.css';

export default function Navbar() {
  const theme = useMantineTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const smallScreen = useMediaQuery('(max-width: 48em)');
  const { isNavbarCollapse, openNavbar, closeNavbar, isNavbarLocked } = useNavbar();

  const [currentAppTitle, setCurrentAppTitle] = useState<string>('');

  const currentNav = useCurrentNav();
  const { pathname } = useLocation();

  const { hovered, ref } = useHover();

  useEffect(() => {
    if (currentNav) {
      setCurrentAppTitle(currentNav.title);
    }
  }, [currentNav]);

  useEffect(() => {
    smallScreen && closeNavbar();
  }, [smallScreen, closeNavbar]);

  const currentHoveredNav = MENUS.find((link) => link.title === currentAppTitle);

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
              {MENUS.map(({ icon: Icon, href, title, subs }) => {
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

      <SubNavBar appTitle={currentAppTitle} isNavbarOpen={isNavbarCollapse} />
    </Flex>
  );
}
