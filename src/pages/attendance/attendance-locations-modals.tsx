import { FormSection } from '@/components/form-section';
import { useGetAttendanceLocation } from '@/hooks/api/attendance';
import { Box, Divider, Grid, Group, Loader, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Circle, MapContainer, Marker, TileLayer } from 'react-leaflet';
import {
    CreateAttendanceLocationForm,
    EditAttendanceLocationForm,
} from './attendance-locations-forms';

interface ViewAttendanceLocationProps {
  id: string;
}

export function ViewAttendanceLocation({ id }: ViewAttendanceLocationProps) {
  const { data, isLoading } = useGetAttendanceLocation({ route: { id } });

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
        No location data found.
      </Text>
    );
  }

  const location = data;
  const hasCoords = location.latitude !== null && location.longitude !== null;

  return (
    <Stack gap="lg">
      <FormSection title="Basic Information">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Location Name" value={location.location_name} />
            <Field label="Description" value={location.description} />
            <Field label="Address" value={location.address} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field
              label="Status"
              value={location.is_active ? '✅ Active' : '❌ Inactive'}
            />
            <Field label="Radius" value={`${location.radius_meters}m`} />
          </Grid.Col>
        </Grid>
      </FormSection>

      {hasCoords && (
        <FormSection title="Location Map">
          <Box style={{ height: 400, borderRadius: 12, overflow: 'hidden' }}>
            <MapContainer
              center={[location.latitude!, location.longitude!]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              <Circle
                center={[location.latitude!, location.longitude!]}
                radius={location.radius_meters!}
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
              />
              <Marker
                position={[location.latitude!, location.longitude!]}
                icon={L.icon({
                  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
                  iconSize: [40, 40],
                })}
              />
            </MapContainer>
          </Box>
          <Text size="sm" c="dimmed" ta="center" mt="xs">
            Blue circle shows the geofence radius ({location.radius_meters}m)
          </Text>
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

export function openAttendanceLocationCreate(refetch: () => void) {
  modals.open({
    title: 'Add New Attendance Location',
    children: (
      <CreateAttendanceLocationForm
        onSubmit={() => {
          refetch();
          modals.closeAll();
        }}
      />
    ),
    size: '75rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openAttendanceLocationEdit(id: string, refetch: () => void) {
  modals.open({
    title: 'Edit Attendance Location',
    children: (
      <EditAttendanceLocationForm
        id={id}
        onSubmit={() => {
          refetch();
          modals.closeAll();
        }}
      />
    ),
    size: '75rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openAttendanceLocationView(id: string) {
  modals.open({
    title: 'View Attendance Location',
    children: <ViewAttendanceLocation id={id} />,
    size: '75rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}
