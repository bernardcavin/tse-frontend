import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Center, Flex, Group, Indicator, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { NoData } from '@/components/no-data';
import useCurrentSubNav from '@/hooks/use-current-sub-nav';
import classes from './sub-navbar.module.css';

interface Props {
  isNavbarOpen: boolean;
  appTitle: string;
}

export default function SubNavBar({ isNavbarOpen, appTitle }: Props) {
  const theme = useMantineTheme();
  const currentNav = useCurrentSubNav({ appTitle });

  const navigate = useNavigate();

  const { pathname } = useLocation();

  const Navicon = currentNav?.icon;

  return (
    <Flex
      className={classes.root}
      data-collapsed={isNavbarOpen}
      h="100%"
      direction="column"
      align="start"
      w="100%"
      py={isNavbarOpen ? 'sm' : 0}
      px={isNavbarOpen ? 'md' : 0}
    >
      {isNavbarOpen && (
        <>
          <Group mt={5}>
            {Navicon && (
              <Navicon size={30} stroke={2} color="var(--mantine-color-blue-9)" variant="Bulk" />
            )}
            <Text fz={20} fw={600} c="blue.9">
              {currentNav?.label}
            </Text>
            <Text fz={14} c="dimmed">
              {currentNav?.description}
            </Text>
          </Group>

          {(currentNav?.subs?.length ?? 0) > 0 ? (
            <Flex flex={1} gap={10} direction="column" align="start" my="md" w="100%">
              {currentNav?.subs?.map(({ href, icon: Icon, label, description }) => {
                const icon = (
                  <Icon
                    color={
                      pathname === href
                        ? theme.colors.blue[2]
                        : pathname === href
                          ? theme.colors.blue[5]
                          : theme.colors.blue[9]
                    }
                    variant="Bulk"
                    size={20}
                    stroke={2}
                  />
                );

                return (
                  <Tooltip label={description} key={href} position="right">
                    <Link
                      key={href}
                      preventScrollReset
                      className={classes.nav_link}
                      data-active={pathname.includes(href)}
                      to={href}
                      onClick={() => {
                        navigate(href);
                      }}
                    >
                      {icon}
                      <Text fz={14}>{label}</Text>
                    </Link>
                  </Tooltip>
                );
              })}
            </Flex>
          ) : null}
        </>
      )}
      {/* 
      <Flex
        p={10}
        bg={colorScheme === 'light' ? 'var(--mantine-color-blue-0)' : 'var(--mantine-color-blue-8)'}
        w="100%"
        justify="space-between"
        align="center"
      >
        <Flex direction="column" align="start">
          <Text fz={14} fw={600}>
            {user?.name}
          </Text>
          <Text fz={12}>{user?.email}</Text>
        </Flex>
      </Flex> */}
    </Flex>
  );
}
