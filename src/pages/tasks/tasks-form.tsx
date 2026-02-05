import { TaskPriority, TaskStatus } from '@/api/entities/tasks';
import { getUserOptions } from '@/api/resources/auth';

import { DataMultiSelect } from '@/components/data-multi-select';
import { FormSection } from '@/components/form-section';
import { DatePickerInput, Select } from '@/components/forms';
import { FileUploadButton } from '@/components/forms/file-upload';
import { FileIdProvider, useFileIdManager } from '@/components/forms/file-upload-provider';
import { FormProvider } from '@/components/forms/form-provider';
import { Textarea } from '@/components/forms/text-area';
import { TextInput } from '@/components/forms/text-input';
import { useCreateTask, useGetTask, useUpdateTask } from '@/hooks/api/tasks';
import { handleFormErrors } from '@/utilities/form';
import { Button, Grid, Group, Loader, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';
import { z } from 'zod';

const TaskValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  assignee_ids: z.array(z.string()).optional(),
  attachment_file_ids: z.array(z.string()).optional(),
});

export function TaskForm() {
  return (
    <Stack gap="md">
      <FormSection title="Task Details">
        <Grid>
          <Grid.Col span={12}>
            <TextInput
              name="title"
              label="Task Title"
              placeholder="e.g. Complete Monthly Report"
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              name="status"
              label="Status"
              placeholder="Select status"
              required
              data={Object.values(TaskStatus)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              name="priority"
              label="Priority"
              placeholder="Select priority"
              required
              data={Object.values(TaskPriority)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DatePickerInput
            required
              name="start_date"
              label="Start Date"
              placeholder="Select date"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DatePickerInput
            required
              name="end_date"
              label="End Date"
              placeholder="Select date"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              name="description"
              label="Description"
              placeholder="Task details..."
              minRows={3}
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      <FormSection title="Assignments">
        <Grid>
          <Grid.Col span={12}>
            <DataMultiSelect
              name="assignee_ids"
              label="Assignees"
              placeholder="Select employees"
              dataGetter={getUserOptions}
              comboboxProps={{zIndex: 9999}}
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      <FileUploadButton
        name="attachment_file_ids"
        label="Attachments"
        multiple
        description="Upload relevant files"
      />
    </Stack>
  );
}

type TaskFormProps = {
  onSubmit: () => void;
};

export function CreateTaskForm({ onSubmit }: TaskFormProps) {
  const { mutate: createTask, isPending } = useCreateTask();

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(TaskValidation),
    initialValues: {
      status: TaskStatus.PLANNED,
      priority: TaskPriority.MEDIUM,
      assignee_ids: [],
    },
  });

  const fileIdManager = useFileIdManager();
  const { updateFilesMetadata } = fileIdManager;

  const handleSubmit = form.onSubmit((variables: any) => {
    createTask(
      { variables },
      {
        onError: (error) => handleFormErrors(form, error),
        onSuccess: () => {
          onSubmit();
          updateFilesMetadata();
        },
      }
    );
  });

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <FileIdProvider fileIdManager={fileIdManager}>
        <Stack>
          <TaskForm />
          <Group justify="flex-end">
            <Button
              type="submit"
              loading={isPending}
              leftSection={<IconPlus size={16} />}
            >
              Create Task
            </Button>
          </Group>
        </Stack>
      </FileIdProvider>
    </FormProvider>
  );
}

interface EditTaskFormProps extends TaskFormProps {
  id: string;
}

export function EditTaskForm({ onSubmit, id }: EditTaskFormProps) {
  const { mutate: updateTask, isPending } = useUpdateTask({ route: { id } });
  const { data: task, isLoading } = useGetTask({ route: { id } });

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(TaskValidation),
    initialValues: {
     assignee_ids: [] as string[],
    },

  });

  useEffect(() => {
    if (task) {
      form.setValues(task);
    }
  }, [task]);

  const fileIdManager = useFileIdManager();
  const { updateFilesMetadata } = fileIdManager;

  const handleSubmit = form.onSubmit((variables: any) => {
    updateTask(
      { variables },
      {
        onError: (error) => handleFormErrors(form, error),
        onSuccess: () => {
          onSubmit();
          updateFilesMetadata();
        },
      }
    );
  });

  return isLoading ? (
    <Loader />
  ) : (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <FileIdProvider fileIdManager={fileIdManager}>
        <Stack>
          <TaskForm />
          <Group justify="flex-end">
            <Button
              type="submit"
              loading={isPending}
              leftSection={<IconDeviceFloppy size={16} />}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </FileIdProvider>
    </FormProvider>
  );
}

