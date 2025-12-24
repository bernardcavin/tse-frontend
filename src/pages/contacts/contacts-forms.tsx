import { Contact } from '@/api/entities/contact';
import { FormSection } from '@/components/form-section';
import { Select } from '@/components/forms';
import { FormProvider } from '@/components/forms/form-provider';
import { Textarea } from '@/components/forms/text-area';
import { TextInput } from '@/components/forms/text-input';
import {
    useCreateContact,
    useEditContact,
    useGetContact,
    useGetZoneOptions,
} from '@/hooks/api/contacts';
import { handleFormErrors } from '@/utilities/form';
import { Autocomplete, Button, Grid, Group, Loader, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';

export function ContactForm() {
  const { data: zoneOptions = [], isLoading: zonesLoading } = useGetZoneOptions();
  const form = useForm();

  return (
    <Stack gap="md">
      {/* 🔹 Basic Information */}
      <FormSection title="Basic Information">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="name"
              label="Nama"
              placeholder="Contact name"
              required
              description="Full name of the contact"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="position"
              label="Jabatan"
              placeholder="e.g. Manager, Engineer"
              description="Job title or position"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="email"
              label="Email"
              placeholder="email@example.com"
              description="Email address"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="phone"
              label="No. Hp"
              placeholder="+62 812 3456 7890"
              description="Phone number"
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 Organization */}
      <FormSection title="Organization">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="company"
              label="Perusahaan"
              placeholder="Company name"
              description="Company or organization name"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              name="regional"
              label="Regional"
              placeholder="Select regional"
              description="Regional area (0 = none)"
              data={[
                { value: '0', label: '-' },
                { value: '1', label: 'Regional 1' },
                { value: '2', label: 'Regional 2' },
                { value: '3', label: 'Regional 3' },
                { value: '4', label: 'Regional 4' },
              ]}
              searchable
              comboboxProps={{ zIndex: 2000 }}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Autocomplete
              label="Zona"
              placeholder="Type or select zone"
              description="Zone area"
              data={zoneOptions.map((z: any) => z.value)}
              {...form.getInputProps('zone')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="field"
              label="Field"
              placeholder="Field name"
              description="Field or project area"
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 Additional Information */}
      <FormSection title="Additional Information" withHide>
        <Grid>
          <Grid.Col span={12}>
            <TextInput
              name="address"
              label="Address"
              placeholder="Full address"
              description="Physical address"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              name="notes"
              label="Notes"
              placeholder="Additional notes"
              autosize
              minRows={2}
              description="Any additional information"
            />
          </Grid.Col>
        </Grid>
      </FormSection>
    </Stack>
  );
}

type ContactFormProps = {
  onSubmit: () => void;
};

export function CreateContactForm({ onSubmit }: ContactFormProps) {
  const { mutate: createContact, isPending } = useCreateContact();
  const { data: zoneOptions = [] } = useGetZoneOptions();

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(Contact),
    transformValues: (values) => ({
      ...values,
      regional: values.regional ? parseInt(String(values.regional), 10) : null,
    }),
  });

  const handleSubmit = form.onSubmit((variables: any) => {
    createContact(
      { variables: variables },
      {
        onError: (error) => handleFormErrors(form, error),
        onSuccess: () => {
          onSubmit();
        },
      }
    );
  });

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <Stack>
        <ContactFormFields zoneOptions={zoneOptions} />
        <Group justify="flex-end">
          <Button type="submit" loading={isPending} mt="md" leftSection={<IconPlus size={16} stroke={5} />}>
            Add
          </Button>
        </Group>
      </Stack>
    </FormProvider>
  );
}

interface EditContactFormProps extends ContactFormProps {
  id: string;
}

export function EditContactForm({ onSubmit, id }: EditContactFormProps) {
  const { mutate: editContact, isPending } = useEditContact({
    route: { id: id },
  });
  const { data, isLoading } = useGetContact({ route: { id: id } });
  const { data: zoneOptions = [] } = useGetZoneOptions();

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(Contact),
    transformValues: (values) => ({
      ...values,
      regional: values.regional ? parseInt(String(values.regional), 10) : null,
    }),
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        ...data,
        regional: data.regional?.toString() ?? null,
      });
    }
  }, [data]);

  const handleSubmit = form.onSubmit((variables: any) => {
    editContact(
      { variables: variables },
      {
        onError: (error) => handleFormErrors(form, error),
        onSuccess: () => {
          onSubmit();
        },
      }
    );
  });

  return isLoading ? (
    <Loader color="blue" size="xl" />
  ) : (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <Stack>
        <ContactFormFields zoneOptions={zoneOptions} />
        <Group justify="flex-end">
          <Button
            type="submit"
            loading={isPending}
            mt="md"
            leftSection={<IconDeviceFloppy size={16} stroke={2} />}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </FormProvider>
  );
}

// Shared form fields component
function ContactFormFields({ zoneOptions }: { zoneOptions: any[] }) {
  return (
    <Stack gap="md">
      {/* 🔹 Basic Information */}
      <FormSection title="Basic Information">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="name"
              label="Nama"
              placeholder="Contact name"
              required
              description="Full name of the contact"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="position"
              label="Jabatan"
              placeholder="e.g. Manager, Engineer"
              description="Job title or position"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="email"
              label="Email"
              placeholder="email@example.com"
              description="Email address"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="phone"
              label="No. Hp"
              placeholder="+62 812 3456 7890"
              description="Phone number"
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 Organization */}
      <FormSection title="Organization">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="company"
              label="Perusahaan"
              placeholder="Company name"
              description="Company or organization name"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              name="regional"
              label="Regional"
              placeholder="Select regional"
              description="Regional area (0 = none)"
              data={[
                { value: '0', label: '-' },
                { value: '1', label: 'Regional 1' },
                { value: '2', label: 'Regional 2' },
                { value: '3', label: 'Regional 3' },
                { value: '4', label: 'Regional 4' },
              ]}
              searchable
              comboboxProps={{ zIndex: 2000 }}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="zone"
              label="Zona"
              placeholder="Type zone name"
              description="Zone area"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="field"
              label="Field"
              placeholder="Field name"
              description="Field or project area"
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 Additional Information */}
      <FormSection title="Additional Information" withHide>
        <Grid>
          <Grid.Col span={12}>
            <TextInput
              name="address"
              label="Address"
              placeholder="Full address"
              description="Physical address"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              name="notes"
              label="Notes"
              placeholder="Additional notes"
              autosize
              minRows={2}
              description="Any additional information"
            />
          </Grid.Col>
        </Grid>
      </FormSection>
    </Stack>
  );
}
