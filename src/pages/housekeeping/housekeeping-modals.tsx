import { HousekeepingType } from '@/api/entities/housekeeping';
import { Badge, Divider, Group, Modal, Stack, Table, Text, Title } from '@mantine/core';
import {
    CreateHousekeepingForm,
    EditHousekeepingForm,
} from './housekeeping-forms';

interface CreateHousekeepingModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateHousekeepingModal({ opened, onClose }: CreateHousekeepingModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>Create Housekeeping Checklist</Text>}
      size="xl"
      styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
      zIndex={2000}
      withCloseButton={false}
    >
      <CreateHousekeepingForm onSubmit={onClose} />
    </Modal>
  );
}

interface EditHousekeepingModalProps {
  opened: boolean;
  onClose: () => void;
  housekeeping: HousekeepingType;
}

export function EditHousekeepingModal({ opened, onClose, housekeeping }: EditHousekeepingModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>Edit Housekeeping Checklist</Text>}
      size="xl"
      styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
      zIndex={2000}
      withCloseButton={false}
    >
      <EditHousekeepingForm id={housekeeping.id!} onSubmit={onClose} />
    </Modal>
  );
}

interface ViewHousekeepingModalProps {
  opened: boolean;
  onClose: () => void;
  housekeeping: HousekeepingType;
}

export function ViewHousekeepingModal({ opened, onClose, housekeeping }: ViewHousekeepingModalProps) {
  const getStatusBadge = (status: string | null | undefined) => {
    if (status === '✔') return <Badge color="green">✔ Baik/Sesuai</Badge>;
    if (status === '✖') return <Badge color="red">✖ Tidak Sesuai</Badge>;
    if (status === 'N/A') return <Badge color="gray">N/A</Badge>;
    return <Badge color="gray">-</Badge>;
  };

  const renderSection = (title: string, items: any[]) => (
    <Stack gap="sm">
      <Title order={5}>{title}</Title>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>No</Table.Th>
            <Table.Th>Item Pemeriksaan</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Keterangan</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item, index) => (
            <Table.Tr key={index}>
              <Table.Td>{index + 1}</Table.Td>
              <Table.Td>{item.item}</Table.Td>
              <Table.Td>{getStatusBadge(item.status)}</Table.Td>
              <Table.Td>{item.notes || '-'}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>View Housekeeping Checklist</Text>}
      size="xl"
      styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
      zIndex={2000}
      withCloseButton={false}
    >
      <Stack gap="lg">
        {/* Basic Information */}
        <Group>
          <Stack gap={4} style={{ flex: 1 }}>
            <Text size="xs" c="dimmed">
              Location/Area
            </Text>
            <Text size="sm" fw={500}>
              {housekeeping.location_area}
            </Text>
          </Stack>
        </Group>

        <Group>
          <Stack gap={4} style={{ flex: 1 }}>
            <Text size="xs" c="dimmed">
              Date
            </Text>
            <Text size="sm" fw={500}>
              {housekeeping.inspection_date ? new Date(housekeeping.inspection_date).toLocaleDateString() : '-'}
            </Text>
          </Stack>
          <Stack gap={4} style={{ flex: 1 }}>
            <Text size="xs" c="dimmed">
              Inspector
            </Text>
            <Text size="sm" fw={500}>
              {housekeeping.inspector_name}
            </Text>
          </Stack>
        </Group>

        {housekeeping.facility_name && (
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              Facility
            </Text>
            <Text size="sm" fw={500}>
              {housekeeping.facility_name}
            </Text>
          </Stack>
        )}

        <Divider />

        {/* Sections */}
        {renderSection('A. KEBERSIHAN AREA KERJA', housekeeping.section_a_items)}
        <Divider />
        {renderSection('B. PENATAAN BARANG & PERALATAN', housekeeping.section_b_items)}
        <Divider />
        {renderSection('C. KESELAMATAN & K3', housekeeping.section_c_items)}
        <Divider />
        {renderSection('D. KEBERSIHAN FASILITAS UMUM', housekeeping.section_d_items)}

        {housekeeping.additional_notes && (
          <>
            <Divider />
            <Stack gap={4}>
              <Text size="sm" fw={500}>
                Catatan Tambahan
              </Text>
              <Text size="sm">{housekeeping.additional_notes}</Text>
            </Stack>
          </>
        )}
      </Stack>
    </Modal>
  );
}
