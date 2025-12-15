import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import {
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
} from '@mantine/core';

import 'leaflet/dist/leaflet.css';

import { QRCodeCanvas } from 'qrcode.react';
import { FileDownloadButton } from '@/components/file-download';
import { FormSection } from '@/components/form-section';
import { CarouselImageAttachment } from '@/components/image-attachment';
import { ActiveBadge } from '@/components/resources/active-badge';
import { useGetFacility } from '@/hooks/api/facilities';
import { formatDateReadable } from '@/utilities/date';

interface ViewFacilityProps {
  id: string;
}

export function ViewFacility({ id }: ViewFacilityProps) {
  const { data, isLoading } = useGetFacility({ route: { id } });

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
        No facility data found.
      </Text>
    );
  }

  const facility = data;
  const hasCoords = facility.latitude !== null && facility.longitude !== null;

  return (
    <Stack gap="lg">
      {/* 🔹 Photos */}
      {facility.photo_file_ids && facility.photo_file_ids.length > 0 && (
        <FormSection title="Photos" withHide>
          <CarouselImageAttachment file_ids={facility.photo_file_ids} />
        </FormSection>
      )}

      {/* 🔹 Basic Information */}
      <FormSection title="Facility Information" withHide>
        {facility.id && (
          <Center>
            <Paper shadow="xs" p="md" withBorder>
              <QRCodeCanvas value={facility.id} size={200} />
            </Paper>
          </Center>
        )}

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Facility Name" value={facility.facility_name} />
            <Field label="Facility Type" value={facility.facility_type} />
            <Field label="Owner Company" value={facility.owner_company} />
            <Field label="Manager Name" value={facility.manager_name} />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Contact Email" value={facility.contact_email} />
            <Field label="Contact Phone" value={facility.contact_phone} />
            <Field label="Description" value={facility.description} />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 Location */}
      <FormSection title="Location Details" withHide>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Address" value={facility.address} />
            <Field label="City" value={facility.city} />
            <Field label="Province" value={facility.province} />
            <Field label="Country" value={facility.country} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Latitude" value={facility.latitude} />
            <Field label="Longitude" value={facility.longitude} />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 Map */}
      {hasCoords && (
        <FormSection title="Map Location" withHide>
          <Box style={{ height: 300, borderRadius: 12, overflow: 'hidden' }}>
            <MapContainer
              center={[facility.latitude!, facility.longitude!]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              <Marker
                position={[facility.latitude!, facility.longitude!]}
                icon={L.icon({
                  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
                  iconSize: [30, 30],
                })}
              >
                <Popup>
                  <strong>{facility.facility_name}</strong>
                  <br />
                  {facility.address ?? 'No address provided'}
                </Popup>
              </Marker>
            </MapContainer>
          </Box>
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
