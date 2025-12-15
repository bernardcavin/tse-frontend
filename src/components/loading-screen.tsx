import { Center, Loader, Modal, Progress, Stack } from '@mantine/core';

export function LoadingScreen() {
  return (
    <Modal
      centered
      radius="xl"
      size={100}
      withCloseButton={false}
      opened={true}
      onClose={() => ''}
      zIndex={2000}
    >
      <Stack justify="center" align="center">
        <Loader size={50} />
      </Stack>
    </Modal>
  );
}
