import { RequestCreateSchema, RequestType } from '@/api/entities/requests';
import { NumberInput, Select, TextInput } from '@/components/forms';
import { FileUploadButton } from '@/components/forms/file-upload';
import { FileIdProvider, useFileIdManager } from '@/components/forms/file-upload-provider';
import { FormProvider } from '@/components/forms/form-provider';
import { Textarea } from '@/components/forms/text-area';
import { useCreateRequest } from '@/hooks/api/requests';
import { ActionIcon, Button, Group, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';

type RequestFormProps = {
  onSubmit: () => void;
};

export function CreateRequestForm({ onSubmit }: RequestFormProps) {
  const { mutate: createRequest, isPending } = useCreateRequest();

  const form = useForm({
    initialValues: {
      type: RequestType.PURCHASE,
      purpose: '',
      estimated_cost: 0,
      items: [{ name: '', cost: 0 }],
      attachment_file_ids: [],
    },
    validate: zodResolver(RequestCreateSchema),
  });

  const fileIdManager = useFileIdManager();

  useEffect(() => {
    const total = form.values.items.reduce((acc, item) => acc + (item.cost || 0), 0);
    form.setFieldValue('estimated_cost', total);
  }, [form.values.items]);

  const handleSubmit = form.onSubmit((values) => {
    createRequest(
      { variables: values },
      {
        onSuccess: () => {
          onSubmit();
          fileIdManager.updateFilesMetadata();
        },
      }
    );
  });

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <FileIdProvider fileIdManager={fileIdManager}>
      <Stack>
        <Select
          label="Request Type"
          placeholder="Select type"
          data={[
            { value: RequestType.PURCHASE, label: 'Purchase' },
            { value: RequestType.REIMBURSEMENT, label: 'Reimbursement' },
          ]}
          name="type"
          required
        />

        <Textarea
          label="Purpose"
          placeholder="Describe the purpose of this request"
          minRows={3}
          name="purpose"
          required
        />

        <Stack gap="xs">
          <Text fw={500} size="sm">Items</Text>
          {form.values.items.map((item, index) => (
            <Group key={index} align="flex-start">
              <TextInput
                placeholder="Item Name"
                style={{ flex: 1 }}
                name={`items.${index}.name`}
              />
              <NumberInput
                placeholder="Cost"
                min={0}
                thousandSeparator="."
                decimalSeparator=","
                prefix="Rp "
                style={{ width: 150 }}
                name={`items.${index}.cost`}
              />
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => form.removeListItem('items', index)}
                disabled={form.values.items.length === 1}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => form.insertListItem('items', { name: '', cost: 0 })}
            size="xs"
            w="fit-content"
          >
            Add Item
          </Button>
        </Stack>

        <NumberInput
          label="Total Estimated Cost"
          placeholder="0"
          min={0}
          thousandSeparator="."
          decimalSeparator=","
          prefix="Rp "
          readOnly
          name="estimated_cost"
        />

        <FileUploadButton
          name="attachment_file_ids"
          label="Attachments"
          description="Upload any supporting documents (quotes, receipts, etc.)"
          multiple
        />

        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={isPending} leftSection={<IconPlus size={16} />}>
            Submit Request
          </Button>
        </Group>
      </Stack>
      </FileIdProvider>
    </FormProvider>
  );
}
