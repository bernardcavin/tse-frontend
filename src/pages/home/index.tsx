import { IconType } from 'react-icons';
import { BsPerson, BsPlus } from 'react-icons/bs';
import { GiCalendar } from 'react-icons/gi';
import { Box, SimpleGrid, Text, UnstyledButton } from '@mantine/core';
import { Page } from '@/components/page';
import { openFacilityCreate } from '@/pages/facilities/facilities-modals';
import { openInventoryCreate } from '@/pages/inventory/inventory-modals';
import { icons } from '@/utilities/icons';

type HomeActions = {
  label: string;
  Icon: IconType;
  onClick: () => void;
  colorStart: string;
  colorEnd: string;
};

export default function HomePage() {
  const actions: HomeActions[] = [
    {
      label: 'New Inventory',
      Icon: icons.inventory,
      onClick: () => openInventoryCreate(() => {}),
      colorStart: 'var(--mantine-color-blue-6)',
      colorEnd: 'var(--mantine-color-blue-7)',
    },
    {
      label: 'New Facility',
      Icon: icons.facilities,
      onClick: () => openFacilityCreate(() => {}),
      colorStart: 'var(--mantine-color-violet-6)',
      colorEnd: 'var(--mantine-color-violet-7)',
    },
    // {
    //   label: 'View Schedule',
    //   Icon: GiCalendar,
    //   onClick: () => {},
    //   colorStart: 'var(--mantine-color-green-6)',
    //   colorEnd: 'var(--mantine-color-green-7)',
    // },
    // {
    //   label: 'Quick Actions',
    //   Icon: BsPlus,
    //   onClick: () => {},
    //   colorStart: 'var(--mantine-color-orange-6)',
    //   colorEnd: 'var(--mantine-color-orange-7)',
    // },
  ];

  return (
    <Page title="Home">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" style={{ padding: '20px' }}>
        {actions.map(({ Icon, label, onClick, colorStart, colorEnd }) => (
          <UnstyledButton
            key={label}
            onClick={onClick}
            style={{
              background: `linear-gradient(135deg, ${colorStart} 0%, ${colorEnd} 100%)`,
              borderRadius: '24px',
              padding: '48px 32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              minHeight: '220px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            }}
          >
            <Box
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={48} color="white" />
            </Box>
            <Text
              size="xl"
              fw={600}
              c="white"
              style={{
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              {label}
            </Text>
          </UnstyledButton>
        ))}
      </SimpleGrid>
    </Page>
  );
}
