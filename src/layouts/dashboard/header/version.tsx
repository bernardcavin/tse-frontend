import { Code } from '@mantine/core';
import { app } from '@/config';

export function Version() {
  return (
    <Code fw={700} bg="blue.9" c="white">
      {`v${app.appVersion}`}
    </Code>
  );
}
