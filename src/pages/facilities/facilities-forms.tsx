import { useEffect } from 'react';
import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { Button, Grid, Group, Loader, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Facility } from '@/api/entities/facility';
import { FormSection } from '@/components/form-section';
import { NumberInput, Select } from '@/components/forms';
import { FileUploadButton, ImageUpload } from '@/components/forms/file-upload';
import { FileIdProvider, useFileIdManager } from '@/components/forms/file-upload-provider';
import { FormProvider } from '@/components/forms/form-provider';
import { Switch } from '@/components/forms/switch';
import { Textarea } from '@/components/forms/text-area';
import { TextInput } from '@/components/forms/text-input';
import { useCreateFacility, useEditFacility, useGetFacility } from '@/hooks/api/facilities';
import { handleFormErrors } from '@/utilities/form';

export function FacilityForm() {
  return (
    <Stack gap="md">
      {/* 🔹 Photos */}
      <ImageUpload
        name="photo_file_ids"
        title="Facility Photos"
        multiple
        description="Upload photos of the facility"
      />

      {/* 🔹 Basic Information */}
      <FormSection title="Basic Information">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="facility_name"
              label="Facility Name"
              placeholder="e.g. Jakarta Main Office, Rig Site Alpha"
              required
              description="Official name or label for the facility"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              name="facility_type"
              label="Facility Type"
              placeholder="Select facility type"
              required
              description="Type or category of this facility"
              data={[
                { value: 'office', label: 'Office' },
                { value: 'warehouse', label: 'Warehouse' },
                { value: 'yard', label: 'Yard' },
                { value: 'rig_site', label: 'Rig Site' },
                { value: 'plant', label: 'Plant' },
                { value: 'other', label: 'Other' },
              ]}
              searchable
              comboboxProps={{ zIndex: 2000 }}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Textarea
              name="description"
              label="Description"
              placeholder="Short summary of the facility, function, or notes"
              autosize
              minRows={2}
              description="Provide additional details about the facility"
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 Location Information */}
      <FormSection title="Location Information">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              required
              name="address"
              label="Address"
              placeholder="e.g. Jl. Sudirman No. 10"
              description="Full street address of the facility"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              required
              name="city"
              label="City"
              placeholder="e.g. Jakarta"
              description="City or municipality"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              required
              name="province"
              label="Province/State"
              placeholder="e.g. DKI Jakarta"
              description="Province or state where the facility is located"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              required
              name="country"
              label="Country"
              placeholder="e.g. Indonesia"
              description="Country of the facility"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberInput
              required
              name="latitude"
              label="Latitude"
              placeholder="e.g. -6.2088"
              description="Latitude coordinate"
              decimalScale={6}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberInput
              required
              name="longitude"
              label="Longitude"
              placeholder="e.g. 106.8456"
              description="Longitude coordinate"
              decimalScale={6}
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 Ownership & Management */}
      <FormSection title="Ownership & Management" withHide>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="owner_company"
              label="Owner Company"
              placeholder="e.g. Pertamina Hulu Energi"
              description="Company that owns or operates this facility"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="manager_name"
              label="Facility Manager"
              placeholder="e.g. Budi Santoso"
              description="Person responsible for the facility operations"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="contact_email"
              label="Contact Email"
              placeholder="e.g. manager@phe.co.id"
              description="Official contact email for the facility"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="contact_phone"
              label="Contact Phone"
              placeholder="e.g. +62 812 3456 7890"
              description="Phone number for facility contact"
            />
          </Grid.Col>
        </Grid>
      </FormSection>
    </Stack>
  );
}

type FacilityFormProps = {
  onSubmit: () => void;
};

export function CreateFacilityForm({ onSubmit }: FacilityFormProps) {
  const { mutate: createFacility, isPending } = useCreateFacility();

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(Facility),
  });

  const fileIdManager = useFileIdManager();
  const { fileIds, updateFilesMetadata } = fileIdManager;

  const handleSubmit = form.onSubmit((variables: any) => {
    createFacility(
      { variables: variables },
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
          <FacilityForm />
          <Group justify="flex-end">
            <Button
              onClick={() => console.log(form.errors)}
              type="submit"
              loading={isPending}
              mt="md"
              leftSection={<IconPlus size={16} stroke={5} />}
            >
              Add
            </Button>
          </Group>
        </Stack>
      </FileIdProvider>
    </FormProvider>
  );
}

interface EditFacilityFormProps extends FacilityFormProps {
  id: string;
}

export function EditFacilityForm({ onSubmit, id }: EditFacilityFormProps) {
  const { mutate: editFacility, isPending } = useEditFacility({
    route: { id: id },
  });
  const { data, isLoading } = useGetFacility({ route: { id: id } });

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(Facility),
  });

  useEffect(() => {
    if (data) form.setValues(data);
  }, [data]);

  const fileIdManager = useFileIdManager();
  const { fileIds, updateFilesMetadata } = fileIdManager;

  const handleSubmit = form.onSubmit((variables: any) => {
    editFacility(
      { variables: variables },
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
          <FacilityForm />
          <Group justify="flex-end">
            <Button
              type="submit"
              onClick={() => console.log(form.errors)}
              loading={isPending}
              mt="md"
              leftSection={<IconDeviceFloppy size={16} stroke={2} />}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </FileIdProvider>
    </FormProvider>
  );
}
