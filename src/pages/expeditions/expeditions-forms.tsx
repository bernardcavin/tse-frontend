import { useCreateExpedition } from '@/hooks/api/expeditions';
import { Button, Group, Stack, Textarea } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useState } from 'react';

interface CreateExpeditionFormProps {
  onSubmit: () => void;
}

export function CreateExpeditionForm({ onSubmit }: CreateExpeditionFormProps) {
  const [notes, setNotes] = useState('');
  const { mutate: createExpedition, isPending } = useCreateExpedition();

  const handleSubmit = () => {
    createExpedition(
      { variables: { notes: notes || undefined } },
      {
        onSuccess: () => {
          onSubmit();
        },
      }
    );
  };

  return (
    <Stack gap="md">
      <Textarea
        label="Notes (Optional)"
        placeholder="Enter notes about this expedition..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        minRows={3}
        autosize
      />

      <Group justify="flex-end" mt="md">
        <Button variant="subtle" onClick={() => modals.closeAll()} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={isPending}>
          Start Expedition
        </Button>
      </Group>
    </Stack>
  );
}
