import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { InventoryTable } from '@/pages/inventory/inventory-table';
import { paths } from '@/routes';
import { Box, Select, Tabs, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconBriefcase,
  IconBuildingWarehouse,
  IconCategory,
  IconDeviceDesktop,
  IconDots,
  IconFirstAidKit,
  IconPackage,
  IconShieldCheck,
  IconShoppingCart,
  IconSofa,
  IconTool,
} from '@tabler/icons-react';
import { useState } from 'react';

// Category definitions with icons
const CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: IconCategory },
  { value: 'Safety Equipment', label: 'Safety Equipment', icon: IconShieldCheck },
  { value: 'Office Supplies', label: 'Office Supplies', icon: IconBriefcase },
  { value: 'Tools & Equipment', label: 'Tools & Equipment', icon: IconTool },
  { value: 'Furniture', label: 'Furniture', icon: IconSofa },
  { value: 'Electronics', label: 'Electronics', icon: IconDeviceDesktop },
  { value: 'Consumables', label: 'Consumables', icon: IconShoppingCart },
  { value: 'Raw Materials', label: 'Raw Materials', icon: IconPackage },
  { value: 'Maintenance Supplies', label: 'Maintenance', icon: IconBuildingWarehouse },
  { value: 'Medical Supplies', label: 'Medical Supplies', icon: IconFirstAidKit },
  { value: 'Other', label: 'Other', icon: IconDots },
] as const;

export default function InventoryPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const theme = useMantineTheme();
  
  // Use dropdown on small screens, tabs on larger screens
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const inventoryPath =
    user?.role === 'MANAGER' ? paths.manager.inventory : paths.employee.inventory;
  const breadcrumbs = [{ label: 'Inventory', href: inventoryPath }, { label: 'List' }];

  const handleCategoryChange = (value: string | null) => {
    if (value) {
      setActiveCategory(value);
    }
  };

  // Find current category for icon display
  const currentCategory = CATEGORIES.find((c) => c.value === activeCategory);
  const CurrentIcon = currentCategory?.icon || IconCategory;

  return (
    <Page title="Inventory">
      <PageHeader title="Inventory" breadcrumbs={breadcrumbs} />

      {/* Responsive Category Selector */}
      {isSmallScreen ? (
        // Dropdown for small screens
        <Box mb="lg">
          <Select
            value={activeCategory}
            onChange={handleCategoryChange}
            data={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            leftSection={<CurrentIcon size={18} />}
            size="md"
            styles={{
              input: {
                fontWeight: 500,
              },
            }}
          />
        </Box>
      ) : (
        // Tabs for larger screens
        <Tabs
          value={activeCategory}
          onChange={handleCategoryChange}
          variant="pills"
          mb="lg"
          styles={{
            root: { 
              overflow: 'auto',
              paddingBottom: '4px',
            },
            list: { 
              flexWrap: 'nowrap', 
              gap: '0.5rem',
              paddingBottom: '4px',
            },
            tab: {
              transition: 'all 0.2s ease',
              '&[data-active]': {
                boxShadow: theme.shadows.sm,
              },
            },
          }}
        >
          <Tabs.List>
            {CATEGORIES.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <Tabs.Tab
                  key={category.value}
                  value={category.value}
                  leftSection={<CategoryIcon size={16} />}
                >
                  {category.label}
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
        </Tabs>
      )}

      <InventoryTable category={activeCategory === 'all' ? undefined : activeCategory} />
    </Page>
  );
}
