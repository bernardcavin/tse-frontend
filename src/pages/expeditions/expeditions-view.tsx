import { FormSection } from '@/components/form-section';
import { useGetExpedition } from '@/hooks/api/expeditions';
import { AddItemFromInventoryModal } from '@/pages/expeditions/add-item-manually-modal';
import {
  Badge,
  Button,
  Divider,
  Grid,
  Group,
  Loader,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  active: 'blue',
  completed: 'green',
  cancelled: 'red',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

interface ViewdataProps {
  id: string;
}

export function ViewExpedition({ id }: ViewdataProps) {
  const { data, isLoading, refetch } = useGetExpedition({
    route: { id },
  });
  const [addItemModalOpened, setAddItemModalOpened] = useState(false);

  if (isLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader size="lg" />
      </Group>
    );
  }

  if (!data) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No data data found.
      </Text>
    );
  }

  const isActive = data.status === 'active';

  return (
    <Stack gap="lg">
      <FormSection title="data Information">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Employee" value={data.employee?.name || data.employee?.username || '-'} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field
              label="Status"
              value={
                <Badge color={STATUS_COLORS[data.status] || 'gray'}>
                  {STATUS_LABELS[data.status] || data.status}
                </Badge>
              }
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field
              label="Started At"
              value={data.started_at ? new Date(data.started_at).toLocaleString() : '-'}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field
              label="Ended At"
              value={data.ended_at ? new Date(data.ended_at).toLocaleString() : 'Ongoing'}
            />
          </Grid.Col>
          {data.notes && (
            <Grid.Col span={12}>
              <Field label="Notes" value={data.notes} />
            </Grid.Col>
          )}
        </Grid>
      </FormSection>

      <FormSection 
        title={
          <Group>
          <Text>Items {data.items?.length || 0}</Text>
          {
          isActive && (
            <Button
              size="xs"
              leftSection={<IconPlus size={16} />}
              onClick={() => setAddItemModalOpened(true)}
            >
              Add Item
            </Button>
          )
        }
        </Group>
      }
      >
        {data.items && data.items.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item Name</Table.Th>
                <Table.Th>Item Code</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Scanned At</Table.Th>
                <Table.Th>Confirmed</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.inventory?.item_name || '-'}</Table.Td>
                  <Table.Td>{item.inventory?.item_code || '-'}</Table.Td>
                  <Table.Td>
                    {item.quantity} {item.inventory?.quantity_uom || 'units'}
                  </Table.Td>
                  <Table.Td>
                    {item.scanned_at ? new Date(item.scanned_at).toLocaleString() : '-'}
                  </Table.Td>
                  <Table.Td>
                    {item.confirmed_at ? (
                      <Badge color="green" size="sm">
                        {item.confirmed_quantity} confirmed
                      </Badge>
                    ) : (
                      <Badge color="gray" size="sm">
                        Not confirmed
                      </Badge>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed" ta="center" py="md">
            No items in this data
          </Text>
        )}
      </FormSection>

      <AddItemFromInventoryModal
        opened={addItemModalOpened}
        onClose={() => setAddItemModalOpened(false)}
        expeditionId={id}
        expeditionItems={data.items?.map((item) => ({
          inventory_id: item.inventory_id,
          quantity: item.quantity,
        })) || []}
        onSuccess={() => refetch()}
      />
    </Stack>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null | React.ReactNode;
}) {
  return (
    <Stack gap={2} mb="sm">
      <Text c="dimmed" fz="sm">
        {label}
      </Text>
      <Text fw={500} style={{ wordBreak: 'break-word' }}>
        {value ?? '-'}
      </Text>
      <Divider my={4} />
    </Stack>
  );
}
