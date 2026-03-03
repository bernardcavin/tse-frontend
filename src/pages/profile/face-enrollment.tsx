import { useAuth } from '@/hooks';
import { useEnrollFace } from '@/hooks/api/employees';
import { getFaceEmbedding } from '@/utils/faceEmbedding';
import { Button, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { useCallback, useRef, useState } from 'react';
import { PiCameraDuotone, PiCheckCircleDuotone, PiWarningCircleDuotone } from 'react-icons/pi';
import Webcam from 'react-webcam';

export function FaceEnrollmentOption() {
  const { user } = useAuth();
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const { mutate: enrollFace, isPending: isEnrolling } = useEnrollFace();

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      // Remove the prefix (data:image/jpeg;base64,) if necessary, but backend decode_base64_image handles it.
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleEnroll = async () => {
    if (!capturedImage) return;
    try {
      const embedding = await getFaceEmbedding(capturedImage);
      enrollFace(embedding, {
        onSuccess: () => {
          setIsCapturing(false);
          setCapturedImage(null);
        },
      });
    } catch (e: any) {
      console.error('Face embedding failed:', e);
    }
  };



  if (!user) return null;

  if (isCapturing) {
    return (
      <Stack align="center" gap="md">
        <Text fw={500}>Position your face clearly in the frame</Text>
        
        {capturedImage ? (
          <img src={capturedImage} alt="Captured face" style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }} />
        ) : (
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'user' }}
              style={{ width: '100%', borderRadius: '8px' }}
            />
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '180px', height: '240px',
              border: '2px dashed rgba(255,255,255,0.8)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />
          </div>
        )}

        <Group mt="md">
          {capturedImage ? (
            <>
              <Button variant="default" onClick={handleRetake} disabled={isEnrolling}>
                Retake Phase
              </Button>
              <Button onClick={handleEnroll} loading={isEnrolling} leftSection={<PiCheckCircleDuotone />}>
                Save Face
              </Button>
            </>
          ) : (
            <>
              <Button variant="default" onClick={() => setIsCapturing(false)}>
                Cancel
              </Button>
              <Button onClick={handleCapture} leftSection={<PiCameraDuotone />}>
                Capture Face
              </Button>
            </>
          )}
        </Group>
      </Stack>
    );
  }

  return (
    <Group justify="space-between" align="flex-start" wrap="nowrap">
      <Group align="flex-start" wrap="nowrap">
        <ThemeIcon 
          size={40} 
          radius="md" 
          variant="light" 
          color={user.has_face_embedding ? 'green' : 'orange'}
        >
          {user.has_face_embedding ? <PiCheckCircleDuotone size="1.5rem" /> : <PiWarningCircleDuotone size="1.5rem" />}
        </ThemeIcon>
        
        <div>
          <Text fw={500}>Facial Recognition Check-in</Text>
          <Text size="sm" c="dimmed">
            {user.has_face_embedding 
              ? 'Your face is enrolled and ready for attendance check-ins.'
              : 'You have not enrolled your face. Please enroll your face to enable check-ins.'}
          </Text>
        </div>
      </Group>

      <Group>
        {!user.has_face_embedding && (
          <Button onClick={() => setIsCapturing(true)} leftSection={<PiCameraDuotone />}>
            Enroll Face
          </Button>
        )}
      </Group>
    </Group>
  );
}
