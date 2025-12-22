import { useCheckIn, useCheckOut, useGetAttendanceStatus } from '@/hooks/api/attendance';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconMapPin, IconQrcode } from '@tabler/icons-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useEffect, useState } from 'react';

export function EmployeeCheckIn() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);

  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useGetAttendanceStatus();
  const { mutate: checkIn, isPending: checkingIn } = useCheckIn();
  const { mutate: checkOut, isPending: checkingOut } = useCheckOut();

  const activeCheckIn = statusData;
  const isCheckedIn = statusData?.status === 'checked_in';

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleScan = async (result: any) => {
    if (!result || !result[0]?.rawValue) return;

    try {
      const qrData = JSON.parse(result[0].rawValue);
      
      if (qrData.type !== 'attendance') {
        alert('Invalid QR code. Please scan an attendance location QR code.');
        return;
      }

      setScannedData(qrData);
      setScannerEnabled(false);
    } catch (error) {
      alert('Invalid QR code format.');
    }
  };

  const handleCheckIn = () => {
    if (!scannedData || !location) return;

    checkIn(
      {
        variables: {
          location_id: scannedData.location_id,
          qr_code_data: JSON.stringify(scannedData),
          latitude: location.latitude,
          longitude: location.longitude,
        },
      },
      {
        onSuccess: () => {
          setScannedData(null);
          refetchStatus();
        },
      }
    );
  };

  const handleCheckOut = () => {
    if (!activeCheckIn || !location) return;

    checkOut(
      {
        variables: {
          attendance_record_id: activeCheckIn.id!,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      },
      {
        onSuccess: () => {
          refetchStatus();
        },
      }
    );
  };

  if (statusLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      {/* Location Status */}
      <Card shadow="sm" padding="lg">
        <Stack gap="md">
          <Group>
            <IconMapPin size={24} />
            <Title order={3}>Your Location</Title>
          </Group>
          {locationError ? (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {locationError}
            </Alert>
          ) : location ? (
            <Text size="sm" c="dimmed">
              📍 Latitude: {location.latitude.toFixed(6)}, Longitude: {location.longitude.toFixed(6)}
            </Text>
          ) : (
            <Group>
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                Getting your location...
              </Text>
            </Group>
          )}
        </Stack>
      </Card>

      {/* Attendance Status */}
      <Card shadow="sm" padding="lg">
        <Stack gap="md">
          <Group>
            <IconCheck size={24} />
            <Title order={3}>Attendance Status</Title>
          </Group>
          {isCheckedIn && activeCheckIn ? (
            <>
              <Alert icon={<IconCheck size={16} />} color="green">
                You are currently checked in
              </Alert>
              <Stack gap="xs">
                <Text size="sm">
                  <strong>Check-in Time:</strong>{' '}
                  {new Date(activeCheckIn.check_in_time).toLocaleString()}
                </Text>
                <Text size="sm">
                  <strong>Location ID:</strong> {activeCheckIn.location_id}
                </Text>
              </Stack>
              <Button
                fullWidth
                color="red"
                onClick={handleCheckOut}
                loading={checkingOut}
                disabled={!location}
              >
                Check Out
              </Button>
            </>
          ) : (
            <Badge color="gray" variant="light" size="lg">
              Not Checked In
            </Badge>
          )}
        </Stack>
      </Card>

      {/* QR Scanner */}
      {!isCheckedIn && (
        <Card shadow="sm" padding="lg">
          <Stack gap="md">
            <Group>
              <IconQrcode size={24} />
              <Title order={3}>Scan QR Code to Check In</Title>
            </Group>

            {!scannerEnabled && !scannedData && (
              <Button fullWidth onClick={() => setScannerEnabled(true)} disabled={!location}>
                Open QR Scanner
              </Button>
            )}

            {scannerEnabled && (
              <Box style={{ borderRadius: 8, overflow: 'hidden' }}>
                <Scanner
                  onScan={handleScan}
                  styles={{
                    container: { width: '100%' },
                  }}
                />
                <Button fullWidth color="gray" mt="md" onClick={() => setScannerEnabled(false)}>
                  Cancel Scan
                </Button>
              </Box>
            )}

            {scannedData && !scannerEnabled && (
              <>
                <Alert icon={<IconCheck size={16} />} color="blue">
                  QR Code scanned successfully!
                </Alert>
                <Text size="sm">
                  <strong>Location ID:</strong> {scannedData.location_id}
                </Text>
                <Group grow>
                  <Button onClick={handleCheckIn} loading={checkingIn} disabled={!location}>
                    Confirm Check In
                  </Button>
                  <Button color="gray" onClick={() => setScannedData(null)}>
                    Cancel
                  </Button>
                </Group>
              </>
            )}

            {!location && (
              <Alert icon={<IconAlertCircle size={16} />} color="orange">
                Location required. Please enable location services.
              </Alert>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
