import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { InventoryTable } from '@/pages/inventory/inventory-table';
import { paths } from '@/routes';

const breadcrumbs = [{ label: 'inventory', href: paths.inventory.root }, { label: 'List' }];

export default function InventoryPage() {
  return (
    <Page title="Inventory">
      <PageHeader title="Inventory" breadcrumbs={breadcrumbs} />

      <InventoryTable />
    </Page>
  );
}
