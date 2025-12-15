import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import {
  Badge,
  Box,
  Center,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { QRCodeCanvas } from 'qrcode.react';
import { FileDownloadButton } from '@/components/file-download';
import { FormSection } from '@/components/form-section';
import { CarouselImageAttachment } from '@/components/image-attachment';
import { ActiveBadge } from '@/components/resources/active-badge';
import { LocationBadge } from '@/components/resources/storage-badge';
import { useGetInventory } from '@/hooks/api/inventory';
import { formatDateReadable } from '@/utilities/date';

interface ViewInventoryFormProps {
  id: string;
}

export function ViewInventoryForm({ id }: ViewInventoryFormProps) {
  const { data, isLoading } = useGetInventory({ route: { id } });

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
        No inventory data found.
      </Text>
    );
  }

  const inventory = data;

  const hasCoords = inventory.current_latitude !== null && inventory.current_longitude !== null;

  return (
    <Stack gap="lg">
      {/* 🔹 Photos */}
      {inventory.photo_file_ids && inventory.photo_file_ids.length > 0 && (
        <FormSection title="Photos" withHide>
          <CarouselImageAttachment file_ids={inventory.photo_file_ids} />
        </FormSection>
      )}

      {/* 🔹 Basic Information */}
      <FormSection title="Basic Information" withHide>
        {inventory.id && (
          <Center>
            <Paper shadow="xs" p="md" withBorder>
              <QRCodeCanvas value={inventory.id} size={200} />
            </Paper>
          </Center>
        )}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Item Name" value={inventory.item_name} />
            <Field label="Item Code" value={inventory.item_code} />
            <Field label="Category" value={inventory.item_category} />
            <Field label="Manufacturer" value={inventory.manufacturer} />
            <Field label="Supplier" value={inventory.supplier} />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Quantity" value={`${inventory.quantity} ${inventory.quantity_uom}`} />
            <Field label="Minimum Stock Level" value={inventory.minimum_stock_level} />
            <Field label="Reorder Level" value={inventory.reorder_level} />
            <Field
              label="Storage Location"
              value={inventory.storage_location?.facility_name ?? '-'}
            />
            <Field
              label="Location Status"
              value={<LocationBadge value={inventory.location_status} />}
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 Facility Information */}
      {inventory.storage_location && (
        <FormSection title="Storage Facility Details" withHide>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Field label="Facility Type" value={inventory.storage_location.facility_type} />
              <Field label="Address" value={inventory.storage_location.address} />
              <Field label="City" value={inventory.storage_location.city} />
              <Field label="Province" value={inventory.storage_location.province} />
              <Field label="Country" value={inventory.storage_location.country} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Field label="Manager Name" value={inventory.storage_location.manager_name} />
              <Field label="Contact Email" value={inventory.storage_location.contact_email} />
              <Field label="Contact Phone" value={inventory.storage_location.contact_phone} />
              <Field label="Owner Company" value={inventory.storage_location.owner_company} />
            </Grid.Col>
          </Grid>
        </FormSection>
      )}

      {/* 🔹 Assignment & Tracking */}
      <FormSection title="Assignment & Tracking" withHide>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Assigned Department" value={inventory.assigned_department} />
            <Field label="Assigned Personnel" value={inventory.assigned_personnel} />
            <Field label="Asset Tag" value={inventory.asset_tag} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Condition Status" value={inventory.condition_status} />
            <Field
              label="Inspection Required"
              value={inventory.inspection_required ? 'Yes ✅' : 'No ❌'}
            />
            <Field
              label="Safety Data Sheet"
              value={inventory.safety_data_sheet_available ? 'Available 📄' : 'Not Available'}
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 Dates */}
      <FormSection title="Key Dates" withHide>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Purchase Date" value={formatDateReadable(inventory.purchase_date)} />
            <Field label="Expiry Date" value={formatDateReadable(inventory.expiry_date)} />
            <Field
              label="Last Inspection"
              value={formatDateReadable(inventory.last_inspection_date)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field
              label="Next Inspection Due"
              value={formatDateReadable(inventory.next_inspection_due)}
            />
            <Field
              label="Certification Expiry"
              value={formatDateReadable(inventory.certification_expiry_date)}
            />
            <Field label="Active" value={<ActiveBadge active={inventory.is_active} />} />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 Current Location Map */}
      {hasCoords && (
        <FormSection title="Current Location" withHide>
          <Box style={{ height: 300, borderRadius: 12, overflow: 'hidden' }}>
            <MapContainer
              center={[inventory.current_latitude!, inventory.current_longitude!]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              <Marker
                position={[inventory.current_latitude!, inventory.current_longitude!]}
                icon={L.icon({
                  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
                  iconSize: [30, 30],
                })}
              >
                <Popup>
                  <strong>{inventory.item_name}</strong>
                  <br />
                  {inventory.storage_location?.facility_name ?? 'Unknown facility'}
                </Popup>
              </Marker>
            </MapContainer>
          </Box>
        </FormSection>
      )}

      {/* 🔹 Attachments */}
      {inventory.attachment_file_ids && inventory.attachment_file_ids.length > 0 && (
        <FormSection title="Attachments" withHide>
          <Table>
            <Table.Tbody>
              {inventory.attachment_file_ids.map((file_id) => (
                <Table.Tr key={file_id}>
                  <Table.Td>
                    <FileDownloadButton file_id={file_id} withFileInfo />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </FormSection>
      )}
    </Stack>
  );
}

// 🔸 Field helper
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
