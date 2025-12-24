import { client } from '@/api/axios';
import { BackendResponse } from '@/api/entities';
import {
    ITTicketAssign,
    ITTicketCreate,
    ITTicketResolve,
    ITTicketUpdate,
} from '@/api/entities/it-tickets';
import { getFacilityOptions } from '@/api/resources/facilities';
import {
    useAssignITTicket,
    useCreateITTicket,
    useITTicket,
    useResolveITTicket,
    useUpdateITTicket,
} from '@/api/resources/it-tickets';
import { FormSection } from '@/components/form-section';
import { ImageUpload } from '@/components/forms/file-upload';
import { FileIdProvider, useFileIdManager } from '@/components/forms/file-upload-provider';
import { FormProvider } from '@/components/forms/form-provider';
import { handleFormErrors } from '@/utilities/form';
import {
    Button,
    Grid,
    Group,
    Loader,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconDeviceFloppy, IconPlus, IconUser } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';

const CATEGORY_OPTIONS = [
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'network', label: 'Network' },
  { value: 'account_access', label: 'Account/Access' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

// Fetch inventory options
async function getInventoryOptions() {
  const response = await client.get('inventory', { params: { page_size: 100 } });
  const data = BackendResponse.parse(response.data).data;
  return (data.data || []).map((item: any) => ({
    value: item.id,
    label: `${item.item_name} (${item.item_code})`,
  }));
}

// Fetch user options for assignment
async function getUserOptions() {
  const response = await client.get('auth/users', { params: { page_size: 100 } });
  const data = BackendResponse.parse(response.data).data;
  return (data.data || []).map((user: any) => ({
    value: user.id,
    label: user.name,
  }));
}

interface ITTicketFormProps {
  form: any;
}

export function ITTicketForm({ form }: ITTicketFormProps) {
  const { data: facilityOptions, isLoading: loadingFacilities } = useQuery({
    queryKey: ['facilityOptions'],
    queryFn: getFacilityOptions,
  });

  const { data: inventoryOptions, isLoading: loadingInventory } = useQuery({
    queryKey: ['inventoryOptions'],
    queryFn: getInventoryOptions,
  });

  return (
    <Stack gap="md">
      {/* 🔹 Attachments */}
      <ImageUpload
        name="photo_file_ids"
        title="Attachments"
        multiple
        description="Upload screenshots or relevant documents"
      />

      {/* 🔹 Ticket Info */}
      <FormSection title="Ticket Information">
        <Grid>
          <Grid.Col span={12}>
            <TextInput
              label="Title"
              placeholder="Brief title for the issue"
              {...form.getInputProps('title')}
              required
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              label="Description"
              placeholder="Describe the issue in detail..."
              {...form.getInputProps('description')}
              minRows={4}
              required
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Category"
              placeholder="Select category"
              data={CATEGORY_OPTIONS}
              {...form.getInputProps('category')}
              required
              comboboxProps={{ zIndex: 2001 }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Priority"
              placeholder="Select priority"
              data={PRIORITY_OPTIONS}
              {...form.getInputProps('priority')}
              required
              comboboxProps={{ zIndex: 2001 }}
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 Location & Inventory */}
      <FormSection title="Location & Related Asset">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Facility (Optional)"
              placeholder="Select facility"
              data={facilityOptions || []}
              {...form.getInputProps('facility_id')}
              searchable
              clearable
              disabled={loadingFacilities}
              comboboxProps={{ zIndex: 2001 }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Related Inventory Item (Optional)"
              placeholder="Link to IT asset"
              data={inventoryOptions || []}
              {...form.getInputProps('inventory_item_id')}
              searchable
              clearable
              disabled={loadingInventory}
              comboboxProps={{ zIndex: 2001 }}
            />
          </Grid.Col>
        </Grid>
      </FormSection>
    </Stack>
  );
}

type FormProps = {
  onSubmit: () => void;
};

export function CreateITTicketForm({ onSubmit }: FormProps) {
  const { mutate: createTicket, isPending } = useCreateITTicket();
  
  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(ITTicketCreate),
    initialValues: {
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      facility_id: null,
      inventory_item_id: null,
    },
  });

  const fileIdManager = useFileIdManager();
  const { updateFilesMetadata } = fileIdManager;

  const handleSubmit = form.onSubmit((values: any) => {
    createTicket(values, {
      onError: (error) => handleFormErrors(form, error),
      onSuccess: () => {
        onSubmit();
        updateFilesMetadata();
      },
    });
  });

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <FileIdProvider fileIdManager={fileIdManager}>
        <Stack>
          <ITTicketForm form={form} />
          <Group justify="flex-end">
            <Button
              type="submit"
              loading={isPending}
              mt="md"
              leftSection={<IconPlus size={16} stroke={5} />}
            >
              Create Ticket
            </Button>
          </Group>
        </Stack>
      </FileIdProvider>
    </FormProvider>
  );
}

interface EditITTicketFormProps extends FormProps {
  id: string;
}

export function EditITTicketForm({ onSubmit, id }: EditITTicketFormProps) {
  const { mutate: updateTicket, isPending } = useUpdateITTicket();
  const { data, isLoading } = useITTicket(id);

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(ITTicketUpdate),
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        facility_id: data.facility_id,
        inventory_item_id: data.inventory_item_id,
      });
    }
  }, [data]);

  const fileIdManager = useFileIdManager();
  const { updateFilesMetadata } = fileIdManager;

  const handleSubmit = form.onSubmit((values: any) => {
    updateTicket(
      { id, data: values },
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
    <Loader color="blue" size="xl" />
  ) : (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <FileIdProvider fileIdManager={fileIdManager}>
        <Stack>
          <ITTicketForm form={form} />
          <Group justify="flex-end">
            <Button
              type="submit"
              loading={isPending}
              mt="md"
              leftSection={<IconDeviceFloppy size={16} stroke={2} />}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </FileIdProvider>
    </FormProvider>
  );
}

interface ResolveITTicketFormProps extends FormProps {
  id: string;
}

export function ResolveITTicketForm({
  onSubmit,
  id,
}: ResolveITTicketFormProps) {
  const { mutate: resolveTicket, isPending } = useResolveITTicket();
  const { data: ticket, isLoading } = useITTicket(id);

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(ITTicketResolve),
    initialValues: {
      resolution_notes: '',
    },
  });

  const handleSubmit = form.onSubmit((values: any) => {
    resolveTicket(
      { id, data: values },
      {
        onError: (error) => handleFormErrors(form, error),
        onSuccess: () => {
          onSubmit();
        },
      }
    );
  });

  if (isLoading) {
    return <Loader color="blue" size="xl" />;
  }

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <Stack>
        <FormSection title="Ticket Details">
          <Text size="sm">
            <strong>Title:</strong> {ticket?.title}
          </Text>
          <Text size="sm">
            <strong>Category:</strong> {ticket?.category}
          </Text>
          <Text size="sm">
            <strong>Description:</strong> {ticket?.description}
          </Text>
        </FormSection>

        <FormSection title="Resolution Notes">
          <Textarea
            name="resolution_notes"
            label="Resolution Notes"
            placeholder="Describe how this issue was resolved..."
            {...form.getInputProps('resolution_notes')}
            minRows={4}
            required
            description="Provide detailed information about the resolution"
          />
        </FormSection>

        <Group justify="flex-end">
          <Button
            type="submit"
            loading={isPending}
            color="green"
            leftSection={<IconCheck size={16} stroke={2} />}
          >
            Mark as Resolved
          </Button>
        </Group>
      </Stack>
    </FormProvider>
  );
}

interface AssignITTicketFormProps extends FormProps {
  id: string;
}

export function AssignITTicketForm({
  onSubmit,
  id,
}: AssignITTicketFormProps) {
  const { mutate: assignTicket, isPending } = useAssignITTicket();
  const { data: ticket, isLoading: loadingTicket } = useITTicket(id);

  const { data: userOptions, isLoading: loadingUsers } = useQuery({
    queryKey: ['userOptions'],
    queryFn: getUserOptions,
  });

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(ITTicketAssign),
    initialValues: {
      assigned_to_id: '',
    },
  });

  useEffect(() => {
    if (ticket?.assigned_to_id) {
      form.setFieldValue('assigned_to_id', ticket.assigned_to_id);
    }
  }, [ticket]);

  const handleSubmit = form.onSubmit((values: any) => {
    assignTicket(
      { id, data: values },
      {
        onError: (error) => handleFormErrors(form, error),
        onSuccess: () => {
          onSubmit();
        },
      }
    );
  });

  if (loadingTicket) {
    return <Loader color="blue" size="xl" />;
  }

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <Stack>
        <FormSection title="Ticket Details">
          <Text size="sm">
            <strong>Title:</strong> {ticket?.title}
          </Text>
          <Text size="sm">
            <strong>Category:</strong> {ticket?.category}
          </Text>
          <Text size="sm">
            <strong>Priority:</strong> {ticket?.priority}
          </Text>
        </FormSection>

        <FormSection title="Assignment">
          <Select
            label="Assign To"
            placeholder="Select IT staff"
            data={userOptions || []}
            {...form.getInputProps('assigned_to_id')}
            searchable
            required
            disabled={loadingUsers}
            comboboxProps={{ zIndex: 2001 }}
          />
        </FormSection>

        <Group justify="flex-end">
          <Button
            type="submit"
            loading={isPending}
            color="blue"
            leftSection={<IconUser size={16} stroke={2} />}
          >
            Assign Ticket
          </Button>
        </Group>
      </Stack>
    </FormProvider>
  );
}
