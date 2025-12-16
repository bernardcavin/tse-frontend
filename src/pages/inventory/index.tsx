import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { InventoryTable } from '@/pages/inventory/inventory-table';
import { paths } from '@/routes';

export default function InventoryPage() {
  const { user } = useAuth();
  
  const inventoryPath = user?.role === 'MANAGER' ? paths.manager.inventory : paths.employee.inventory;
  const breadcrumbs = [{ label: 'Inventory', href: inventoryPath }, { label: 'List' }];

  return (
    <Page title="Inventory">
      <PageHeader title="Inventory" breadcrumbs={breadcrumbs} />

      <InventoryTable />
    </Page>
  );
}
