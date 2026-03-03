import { useAuth } from '@/hooks';
import { useCheckIn, useCheckOut, useGetAttendanceStatus } from '@/hooks/api/attendance';
import { paths } from '@/routes';
import { getFaceEmbedding } from '@/utils/faceEmbedding';
import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCheck,
  IconFileDescription,
  IconMapPin,
} from '@tabler/icons-react';
import jsQR from 'jsqr';
import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { LeaveRequestModal } from '../leave-management/leave-request-modal';

type ViewMode = 'IDLE' | 'QR_SCAN' | 'FACE_CAPTURE';

export function EmployeeCheckIn() {
  const { user } = useAuth();
  const webcamRef = useRef<Webcam>(null);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('IDLE');
  const [scannedData, setScannedData] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processingFace, setProcessingFace] = useState(false);

  const {
    data: statusData,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useGetAttendanceStatus();
  const { mutate: checkIn, isPending: checkingIn } = useCheckIn();
  const { mutate: checkOut, isPending: checkingOut } = useCheckOut();

  const activeCheckIn = statusData?.active_check_in;
  const isCheckedIn = statusData?.is_checked_in;

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          setLocationError('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  // QR scanning loop using jsQR — reads frames from the single Webcam component
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (viewMode === 'QR_SCAN') {
      interval = setInterval(() => {
        if (webcamRef.current) {
          const video = webcamRef.current.video;
          if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
              });
              if (code) {
                try {
                  const qrData = JSON.parse(code.data);
                  if (qrData.type === 'attendance') {
                    setScannedData(qrData);
                    setViewMode('FACE_CAPTURE');
                    notifications.show({
                      title: 'QR Detected',
                      message: 'Now capture your face to complete check-in.',
                      color: 'blue',
                    });
                  }
                } catch {
                  // Ignore invalid QR data
                }
              }
            }
          }
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [viewMode]);

  const handleCaptureFace = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, []);

  const handleCheckIn = async () => {
    if (!scannedData || !location || !capturedImage) return;

    setProcessingFace(true);
    try {
      const embedding = await getFaceEmbedding(capturedImage);
      checkIn(
        {
          variables: {
            location_id: scannedData.location_id,
            qr_code_data: JSON.stringify(scannedData),
            latitude: location.latitude,
            longitude: location.longitude,
            face_embedding: embedding,
          },
        },
        {
          onSuccess: () => {
            setScannedData(null);
            setCapturedImage(null);
            setViewMode('IDLE');
            refetchStatus();
          },
          onError: (error: any) => {
            notifications.show({
              title: 'Check-In Failed',
              message: error?.response?.data?.detail || 'Face verification failed. Please try again.',
              color: 'red',
            });
          },
        }
      );
    } catch (e) {
      notifications.show({ title: 'Error', message: 'Failed to process face image.', color: 'red' });
    } finally {
      setProcessingFace(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeCheckIn || !location || !capturedImage) return;

    setProcessingFace(true);
    try {
      const embedding = await getFaceEmbedding(capturedImage);
      checkOut(
        {
          variables: {
            attendance_record_id: activeCheckIn.id!,
            latitude: location.latitude,
            longitude: location.longitude,
            face_embedding: embedding,
          },
        },
        {
          onSuccess: () => {
            setCapturedImage(null);
            setViewMode('IDLE');
            refetchStatus();
          },
          onError: (error: any) => {
            notifications.show({
              title: 'Check-Out Failed',
              message: error?.response?.data?.detail || 'Face verification failed. Please try again.',
              color: 'red',
            });
          },
        }
      );
    } catch (e) {
      notifications.show({ title: 'Error', message: 'Failed to process face image.', color: 'red' });
    } finally {
      setProcessingFace(false);
    }
  };

  const resetFlow = () => {
    setViewMode('IDLE');
    setScannedData(null);
    setCapturedImage(null);
  };

  if (statusLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!user?.has_face_embedding) {
    return (
      <Stack gap="lg">
        <Alert icon={<IconAlertCircle size={16} />} color="orange" title="Face Enrollment Required">
          You must enroll your face from your profile settings before you can check in or check out.
        </Alert>
      </Stack>
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
              📍 Latitude: {location.latitude.toFixed(6)}, Longitude:{' '}
              {location.longitude.toFixed(6)}
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

      <Group justify="flex-end">
        <Button
          component="a"
          href={
            user?.role === 'MANAGER'
              ? paths.manager.attendanceHistory
              : paths.employee.attendanceHistory
          }
          variant="outline"
        >
          View My Attendance History
        </Button>
      </Group>

      {/* Attendance Status & Actions */}
      <Card shadow="sm" padding="lg">
        <Stack gap="md">
          <Group>
            <IconCheck size={24} />
            <Title order={3}>Attendance Status</Title>
          </Group>

          {viewMode === 'IDLE' && (
            <>
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
                    color="orange"
                    onClick={() => { setCapturedImage(null); setViewMode('FACE_CAPTURE'); }}
                    disabled={!location}
                  >
                    Check Out (Face Verification)
                  </Button>
                </>
              ) : (
                <>
                  <Badge color="gray" variant="light" size="lg">
                    Not Checked In
                  </Badge>
                  <Button
                    fullWidth
                    onClick={() => { setScannedData(null); setCapturedImage(null); setViewMode('QR_SCAN'); }}
                    disabled={!location}
                  >
                    Check In (QR + Face Verification)
                  </Button>
                </>
              )}
            </>
          )}

          {/* QR Scan + Face Capture — uses a SINGLE Webcam component */}
          {(viewMode === 'QR_SCAN' || viewMode === 'FACE_CAPTURE') && (
            <Stack gap="md" align="center">
              {viewMode === 'QR_SCAN' && (
                <Alert title="Step 1: Scan Location QR Code" color="blue" w="100%">
                  Hold the attendance location QR code up to the camera.
                </Alert>
              )}

              {viewMode === 'FACE_CAPTURE' && (
                <Alert
                  title={!isCheckedIn ? 'Step 2: Face Verification' : 'Check Out: Face Verification'}
                  color="blue"
                  w="100%"
                >
                  {capturedImage
                    ? 'Review your face capture and submit.'
                    : 'Position your face clearly in the frame and capture.'}
                </Alert>
              )}

              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured face"
                  style={{ width: '100%', maxWidth: 400, borderRadius: 8 }}
                />
              ) : (
                <div style={{ position: 'relative' }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: 'user' }}
                    style={{ width: '100%', maxWidth: 400, borderRadius: 8 }}
                  />
                  {viewMode === 'QR_SCAN' && (
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 200, height: 200,
                      border: '2px dashed rgba(255,255,255,0.7)',
                      borderRadius: 10,
                    }} />
                  )}
                  {viewMode === 'FACE_CAPTURE' && (
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 180, height: 240,
                      border: '2px dashed rgba(255,255,255,0.8)',
                      borderRadius: '50%',
                      pointerEvents: 'none',
                    }} />
                  )}
                </div>
              )}

              <Group justify="center">
                <Button variant="default" onClick={resetFlow} disabled={checkingIn || checkingOut || processingFace}>
                  Cancel
                </Button>
                {viewMode === 'FACE_CAPTURE' && !capturedImage && (
                  <Button onClick={handleCaptureFace}>Capture Face</Button>
                )}
                {viewMode === 'FACE_CAPTURE' && capturedImage && (
                  <>
                    <Button variant="default" onClick={() => setCapturedImage(null)} disabled={checkingIn || checkingOut || processingFace}>
                      Retake
                    </Button>
                    {!isCheckedIn ? (
                      <Button
                        onClick={handleCheckIn}
                        loading={checkingIn || processingFace}
                        color="green"
                      >
                        Submit Check-In
                      </Button>
                    ) : (
                      <Button
                        onClick={handleCheckOut}
                        loading={checkingOut || processingFace}
                        color="orange"
                      >
                        Submit Check-Out
                      </Button>
                    )}
                  </>
                )}
              </Group>
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Leave Request Button */}
      <Card shadow="sm" padding="lg">
        <Stack gap="md">
          <Group>
            <IconFileDescription size={24} />
            <Title order={3}>Leave Request</Title>
          </Group>
          <Text size="sm" c="dimmed">
            Need to take time off? Submit a leave request here.
          </Text>
          <Button variant="outline" onClick={openCreateModal}>
            Request Leave
          </Button>
        </Stack>
      </Card>

      <LeaveRequestModal opened={createModalOpened} onClose={closeCreateModal} />

      {!location && (
        <Alert icon={<IconAlertCircle size={16} />} color="orange">
          Location required. Please enable location services.
        </Alert>
      )}
    </Stack>
  );
}
