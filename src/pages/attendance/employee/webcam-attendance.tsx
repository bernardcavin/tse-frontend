import { useAuth } from '@/hooks';
import { useCheckIn, useCheckOut, useGetAttendanceStatus } from '@/hooks/api/attendance';
import { getFaceEmbedding } from '@/utils/faceEmbedding';
import { Alert, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import jsQR from 'jsqr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PiCameraDuotone, PiCheckCircleDuotone, PiSignInDuotone, PiSignOutDuotone, PiWarningCircleDuotone } from 'react-icons/pi';
import Webcam from 'react-webcam';

export function WebcamAttendance() {
  const { user } = useAuth();
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'IDLE' | 'QR_SCAN' | 'FACE_SCAN'>('IDLE');
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  
  const { data: statusInfo, refetch: refetchStatus } = useGetAttendanceStatus();
  
  const { mutate: checkIn, isPending: isCheckingIn } = useCheckIn();
  const { mutate: checkOut, isPending: isCheckingOut } = useCheckOut();

  const isCheckedIn = statusInfo?.is_checked_in;
  const activeRecord = statusInfo?.active_check_in;

  // QR Scanning interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (viewMode === 'QR_SCAN') {
      interval = setInterval(() => {
        captureAndScanQR();
      }, 500);
    }
    return () => clearInterval(interval);
  }, [viewMode]);

  const captureAndScanQR = useCallback(() => {
    if (webcamRef.current) {
      const video = webcamRef.current.video;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code) {
            setQrCodeData(code.data);
            setViewMode('FACE_SCAN'); // Move to face scan once QR is detected
            notifications.show({
              title: "QR Detected",
              message: "Please hold your face in the camera frame to complete check-in.",
              color: "blue"
            });
          }
        }
      }
    }
  }, [webcamRef]);

  const handleCaptureFace = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const requestLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  };

  const handleStartCheckIn = async () => {
    try {
      const loc = await requestLocation();
      setCurrentLocation(loc);
    } catch (e) {
      notifications.show({ title: 'Error', message: 'Location permission required.', color: 'red' });
      return;
    }
    setQrCodeData(null);
    setCapturedImage(null);
    setViewMode('QR_SCAN'); // Start by scanning QR
  };

  const handleStartCheckOut = async () => {
    try {
      const loc = await requestLocation();
      setCurrentLocation(loc);
    } catch (e) {
      notifications.show({ title: 'Error', message: 'Location permission required.', color: 'red' });
      return;
    }
    setCapturedImage(null);
    setViewMode('FACE_SCAN'); // Check out only needs face scan
  };

  const submitCheckIn = async () => {
    if (!qrCodeData || !capturedImage || !currentLocation) return;
    
    try {
      const qrParsed = JSON.parse(qrCodeData);
      const embedding = await getFaceEmbedding(capturedImage);
      checkIn({
        variables: {
          location_id: qrParsed.location_id,
          qr_code_data: qrCodeData,
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          face_embedding: embedding
        }
      }, {
        onSuccess: () => {
          setViewMode('IDLE');
          refetchStatus();
        }
      });
    } catch (e) {
      notifications.show({ title: 'Error', message: 'Failed to process face or QR code.', color: 'red' });
      setViewMode('IDLE');
    }
  };

  const submitCheckOut = async () => {
    if (!activeRecord || !capturedImage || !currentLocation || !activeRecord.id) return;

    try {
      const embedding = await getFaceEmbedding(capturedImage);
      checkOut({
        variables: {
          attendance_record_id: activeRecord.id,
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          face_embedding: embedding
        }
      }, {
        onSuccess: () => {
          setViewMode('IDLE');
          refetchStatus();
        }
      });
    } catch (e) {
      notifications.show({ title: 'Error', message: 'Failed to process face.', color: 'red' });
    }
  };

  if (!user) return null;

  if (!user.has_face_embedding) {
    return (
      <Card withBorder>
        <Alert icon={<PiWarningCircleDuotone size="1.5rem" />} title="Action Required" color="orange">
          You must enroll your face from your profile settings before you can check in or check out.
        </Alert>
      </Card>
    );
  }

  return (
    <Card withBorder>
      <Title order={4} mb="md">Web Attendance</Title>

      {viewMode === 'IDLE' && (
        <Stack align="center" py="xl">
          <Text c="dimmed">{isCheckedIn ? 'You are currently checked in.' : 'You are currently checked out.'}</Text>
          <Group>
            {!isCheckedIn ? (
              <Button size="lg" leftSection={<PiSignInDuotone size="1.5rem" />} onClick={handleStartCheckIn}>
                Check In (QR + Face)
              </Button>
            ) : (
              <Button size="lg" color="orange" leftSection={<PiSignOutDuotone size="1.5rem" />} onClick={handleStartCheckOut}>
                Check Out (Face Only)
              </Button>
            )}
          </Group>
        </Stack>
      )}

      {(viewMode === 'QR_SCAN' || viewMode === 'FACE_SCAN') && (
        <Stack align="center" gap="md">
          {viewMode === 'QR_SCAN' && (
            <Alert title="Step 1: Scan Location QR Code" color="blue" w="100%">
              Hold the location's QR code up to the camera.
            </Alert>
          )}

          {viewMode === 'FACE_SCAN' && (
            <Alert title={!isCheckedIn ? "Step 2: Face Scan" : "Check Out: Face Scan"} color="blue" w="100%">
              {capturedImage ? "Review your face capture and submit." : "Position your face clearly in the frame and capture."}
            </Alert>
          )}

          {capturedImage ? (
            <img src={capturedImage} alt="Captured face" style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }} />
          ) : (
            <div style={{ position: 'relative' }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'user' }}
                style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
              />
              {viewMode === 'QR_SCAN' && (
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: '200px', height: '200px', border: '2px dashed rgba(255,255,255,0.7)', borderRadius: '10px'
                }} />
              )}
              {viewMode === 'FACE_SCAN' && (
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '180px', height: '240px',
                  border: '2px dashed rgba(255,255,255,0.8)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }} />
              )}
            </div>
          )}

          <Group justify="center">
            <Button variant="default" onClick={() => setViewMode('IDLE')} disabled={isCheckingIn || isCheckingOut}>
              Cancel
            </Button>
            
            {viewMode === 'FACE_SCAN' && !capturedImage && (
              <Button onClick={handleCaptureFace} leftSection={<PiCameraDuotone />}>
                Capture Face
              </Button>
            )}

            {viewMode === 'FACE_SCAN' && capturedImage && (
              <>
                <Button variant="default" onClick={() => setCapturedImage(null)} disabled={isCheckingIn || isCheckingOut}>
                  Retake
                </Button>
                {!isCheckedIn ? (
                  <Button onClick={submitCheckIn} loading={isCheckingIn} color="green" leftSection={<PiCheckCircleDuotone />}>
                    Submit Check-In
                  </Button>
                ) : (
                  <Button onClick={submitCheckOut} loading={isCheckingOut} color="orange" leftSection={<PiCheckCircleDuotone />}>
                    Submit Check-Out
                  </Button>
                )}
              </>
            )}
          </Group>
        </Stack>
      )}
    </Card>
  );
}
