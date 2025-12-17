import { AttendanceLocation } from '@/api/entities/attendance';
import { getFacilityCoordinates, getFacilityOptions } from '@/api/resources/facilities';
import { FormSection } from '@/components/form-section';
import { NumberInput } from '@/components/forms';
import { FormProvider } from '@/components/forms/form-provider';
import { Switch } from '@/components/forms/switch';
import { Textarea } from '@/components/forms/text-area';
import { TextInput } from '@/components/forms/text-input';
import {
  useCreateAttendanceLocation,
  useGetAttendanceLocation,
  useUpdateAttendanceLocation,
} from '@/hooks/api/attendance';
import { handleFormErrors } from '@/utilities/form';
import { Button, Grid, Group, Loader, Select as MantineSelect, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import 'leaflet/dist/leaflet.css';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

function LocationPicker({ onLocationChange, initialLat, initialLon }: any) {
  const [position, setPosition] = useState<[number, number]>([
    initialLat || -6.2088,
    initialLon || 106.8456,
  ]);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationChange(lat, lng);
      },
    });
    return null;
  };

  useEffect(() => {
    if (initialLat && initialLon) {
      setPosition([initialLat, initialLon]);
    }
  }, [initialLat, initialLon]);

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: 400, width: '100%', borderRadius: 8 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      <Marker position={position} />
      <MapEvents />
    </MapContainer>
  );
}

interface AttendanceLocationFormProps {
  form: any;
}

export function AttendanceLocationForm({ form }: AttendanceLocationFormProps) {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  
  // Fetch facility options
  const { data: facilityOptions, isLoading: loadingOptions } = useQuery({
    queryKey: ['facilityOptions'],
    queryFn: getFacilityOptions,
  });

  // Fetch facility coordinates when a facility is selected
  const { data: facilityCoords, isLoading: loadingCoords } = useQuery({
    queryKey: ['facilityCoordinates', selectedFacilityId],
    queryFn: () => getFacilityCoordinates(selectedFacilityId!),
    enabled: !!selectedFacilityId,
  });

  // Auto-populate form when facility coordinates are loaded
  useEffect(() => {
    if (facilityCoords && selectedFacilityId) {
      const selectedFacility = facilityOptions?.find(f => f.value === selectedFacilityId);
      if (selectedFacility) {
        form.setFieldValue('location_name', selectedFacility.label);
      }
      form.setFieldValue('latitude', facilityCoords.latitude);
      form.setFieldValue('longitude', facilityCoords.longitude);
    }
  }, [facilityCoords, selectedFacilityId, facilityOptions]);

  const handleLocationChange = (lat: number, lng: number) => {
    form.setFieldValue('latitude', lat);
    form.setFieldValue('longitude', lng);
  };

  return (
    <Stack gap="md">
      {/* 🔹 Facility Selector */}
      <FormSection title="Import from Facility (Optional)">
        <Grid>
          <Grid.Col span={12}>
            <MantineSelect
              label="Select Facility"
              placeholder="Choose a facility to auto-fill location details"
              data={facilityOptions || []}
              value={selectedFacilityId}
              onChange={(value) => setSelectedFacilityId(value)}
              searchable
              clearable
              description="Selecting a facility will auto-populate name and coordinates"
              disabled={loadingOptions}
              comboboxProps={{zIndex: 2000}}
            />
            {loadingCoords && <Text size="sm" c="dimmed">Loading facility coordinates...</Text>}
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 Basic Information */}
      <FormSection title="Basic Information">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="location_name"
              label="Location Name"
              placeholder="e.g. Jakarta Office, Rig Site Alpha"
              required
              description="Name of the attendance location"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Switch name="is_active" label="Active" description="Location is active for check-in" />
          </Grid.Col>

          <Grid.Col span={12}>
            <Textarea
              name="description"
              label="Description"
              placeholder="Additional details about this location"
              autosize
              minRows={2}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              name="address"
              label="Address"
              placeholder="e.g. Jl. Sudirman No. 10, Jakarta"
              description="Physical address of the location"
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 Location & Geofence */}
      <FormSection title="Location & Geofence">
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Click on the map to set the location coordinates. The geofence radius determines how close
            employees must be to check in.
          </Text>

          <LocationPicker
            onLocationChange={handleLocationChange}
            initialLat={form.values.latitude}
            initialLon={form.values.longitude}
          />

          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                required
                name="latitude"
                label="Latitude"
                placeholder="e.g. -6.2088"
                description="Click map to update"
                decimalScale={6}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                required
                name="longitude"
                label="Longitude"
                placeholder="e.g. 106.8456"
                description="Click map to update"
                decimalScale={6}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                required
                name="radius_meters"
                label="Geofence Radius (meters)"
                placeholder="e.g. 100"
                description="Check-in radius"
                min={1}
                max={10000}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </FormSection>
    </Stack>
  );
}

type LocationFormProps = {
  onSubmit: () => void;
};

export function CreateAttendanceLocationForm({ onSubmit }: LocationFormProps) {
  const { mutate: createLocation, isPending } = useCreateAttendanceLocation();

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(AttendanceLocation),
    initialValues: {
      location_name: '',
      description: '',
      address: '',
      latitude: -6.2088,
      longitude: 106.8456,
      radius_meters: 100,
      is_active: true,
    },
  });

  const handleSubmit = form.onSubmit((variables: any) => {
    createLocation(
      { variables },
      {
        onError: (error) => handleFormErrors(form, error),
        onSuccess: () => {
          onSubmit();
        },
      }
    );
  });

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <Stack>
        <AttendanceLocationForm form={form} />
        <Group justify="flex-end">
          <Button
            type="submit"
            loading={isPending}
            mt="md"
            leftSection={<IconPlus size={16} stroke={5} />}
          >
            Add Location
          </Button>
        </Group>
      </Stack>
    </FormProvider>
  );
}

interface EditAttendanceLocationFormProps extends LocationFormProps {
  id: string;
}

export function EditAttendanceLocationForm({ onSubmit, id }: EditAttendanceLocationFormProps) {
  const { mutate: updateLocation, isPending } = useUpdateAttendanceLocation({
    route: { id },
  });
  const { data, isLoading } = useGetAttendanceLocation({ route: { id } });

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(AttendanceLocation),
  });

  useEffect(() => {
    if (data) form.setValues(data);
  }, [data]);

  const handleSubmit = form.onSubmit((variables: any) => {
    updateLocation(
      { variables },
      {
        onError: (error) => handleFormErrors(form, error),
        onSuccess: () => {
          onSubmit();
        },
      }
    );
  });

  return isLoading ? (
    <Loader color="blue" size="xl" />
  ) : (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <Stack>
        <AttendanceLocationForm form={form} />
        <Group justify="flex-end">
          <Button
            type="submit"
            loading={isPending}
            mt="md"
            leftSection={<IconDeviceFloppy size={16} stroke={2} />}
          >
            Save Changes
          </Button>
        </Group>
      </Stack>
    </FormProvider>
  );
}
