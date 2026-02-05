import { LeaveRequestCreate } from '@/api/entities/attendance';
import { ImageUpload } from '@/components/forms/file-upload';
import { FileIdProvider, useFileIdManager } from '@/components/forms/file-upload-provider';
import { FormProvider } from '@/components/forms/form-provider';
import { useCreateLeaveRequest } from '@/hooks/api/attendance';
import { handleFormErrors } from '@/utilities/form';
import { Button, Group, Modal, Select, Stack, Textarea } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';

interface LeaveRequestModalProps {
  opened: boolean;
  onClose: () => void;
}

export function LeaveRequestModal({ opened, onClose }: LeaveRequestModalProps) {
  const { mutate: createLeaveRequest, isPending } = useCreateLeaveRequest();
  const fileIdManager = useFileIdManager();
  const { updateFilesMetadata, clearFileIds } = fileIdManager;

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(LeaveRequestCreate),
    initialValues: {
      leave_type: 'sick' as any,
      start_date: new Date(),
      end_date: new Date(),
      reason: '',
      attachment_file_ids: [] as string[],
    },
  });

  const handleSubmit = form.onSubmit((values: any) => {
    createLeaveRequest(
      { variables: values },
      {
        onSuccess: () => {
          updateFilesMetadata();
          onClose();
          form.reset();
          clearFileIds();
        },
        onError: (error) => {
            handleFormErrors(form, error);
            notifications.show({
                title: 'Error',
                message: error.message || 'Failed to submit leave request',
                color: 'red',
            });
        },
      }
    );
  });
  
  // Reset form when modal opens
  useEffect(() => {
    if (opened) {
        form.reset();
        clearFileIds();
        form.setValues({
            leave_type: 'sick',
            start_date: new Date(),
            end_date: new Date(),
            reason: '',
            attachment_file_ids: [],
        });
    }
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title="Request Leave" size="lg">
      <FileIdProvider fileIdManager={fileIdManager}>
        <FormProvider form={form} onSubmit={handleSubmit}>
            <Stack>
            <Select
                label="Leave Type"
                placeholder="Select leave type"
                data={[
                { value: 'sick', label: 'Sick Leave' },
                { value: 'paid', label: 'Paid Leave' },
                { value: 'unpaid', label: 'Unpaid Leave' },
                { value: 'maternity', label: 'Maternity Leave' },
                { value: 'paternity', label: 'Paternity Leave' },
                { value: 'other', label: 'Other' },
                ]}
                key={form.key('leave_type')}
                {...form.getInputProps('leave_type')}
            />

            <Group grow>
                <DatePickerInput
                label="Start Date"
                placeholder="Pick date"
                key={form.key('start_date')}
                {...form.getInputProps('start_date')}
                />
                <DatePickerInput
                label="End Date"
                placeholder="Pick date"
                key={form.key('end_date')}
                {...form.getInputProps('end_date')}
                />
            </Group>

            <Textarea
                label="Reason"
                placeholder="Reason for leave"
                key={form.key('reason')}
                {...form.getInputProps('reason')}
                minRows={3}
                autosize
            />

            <ImageUpload
                name="attachment_file_ids"
                title="Attachments"
                description="Upload supporting documents (e.g. medical certificate)"
                multiple
            />
            </Stack>

            <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={onClose}>
                Cancel
            </Button>
            <Button type="submit" loading={isPending}>
                Submit Request
            </Button>
            </Group>
        </FormProvider>
      </FileIdProvider>
    </Modal>
  );
}
