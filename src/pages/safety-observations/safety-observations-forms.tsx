import {
    SafetyObservationClose,
    SafetyObservationCreate,
    SafetyObservationResolve,
    SafetyObservationUpdate
} from '@/api/entities/safety-observations';
import { getFacilityOptions } from '@/api/resources/facilities';
import {
    useCloseSafetyObservation,
    useCreateSafetyObservation,
    useResolveSafetyObservation,
    useSafetyObservation,
    useUpdateSafetyObservation,
} from '@/api/resources/safety-observations';
import { FormSection } from '@/components/form-section';
import { ImageUpload } from '@/components/forms/file-upload';
import { FileIdProvider, useFileIdManager } from '@/components/forms/file-upload-provider';
import { FormProvider } from '@/components/forms/form-provider';
import { normalizeDate } from '@/utilities/date';
import { handleFormErrors } from '@/utilities/form';
import {
    Button,
    Checkbox,
    Grid,
    Group,
    Loader,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput,
} from '@mantine/core';
import { DatePickerInput, TimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconBan, IconCheck, IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useEffect, useState } from 'react';

const OBSERVATION_TYPES = [
  { value: 'safe_act', label: 'Tindakan Aman (Safe Act)' },
  { value: 'unsafe_act', label: 'Tindakan Tidak Aman (Unsafe Act)' },
  { value: 'safe_condition', label: 'Kondisi Aman (Safe Condition)' },
  { value: 'unsafe_condition', label: 'Kondisi Tidak Aman (Unsafe Condition)' },
  { value: 'near_miss', label: 'Near Miss / Hampir Celaka' },
  { value: 'improvement_suggestion', label: 'Usulan Perbaikan' },
];

const OBSERVATION_CATEGORIES = [
  { value: 'worker_behavior', label: 'Perilaku / Tindakan Pekerja' },
  { value: 'equipment_machinery', label: 'Peralatan / Mesin' },
  { value: 'work_environment', label: 'Lingkungan Kerja' },
  { value: 'procedure_work_method', label: 'Prosedur / Metode Kerja' },
  { value: 'ppe', label: 'APD (Alat Pelindung Diri)' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'other', label: 'Lainnya' },
];

const POTENTIAL_IMPACTS = [
  { value: 'minor_injury', label: 'Cedera Ringan' },
  { value: 'serious_injury', label: 'Cedera Berat' },
  { value: 'equipment_damage', label: 'Kerusakan Alat' },
  { value: 'environmental_damage', label: 'Kerusakan Lingkungan' },
  { value: 'fatality', label: 'Fatality' },
  { value: 'no_impact', label: 'Tidak Ada Dampak' },
];

interface SafetyObservationFormProps {
  form: any;
}

export function SafetyObservationForm({ form }: SafetyObservationFormProps) {
  const { data: facilityOptions, isLoading: loadingOptions } = useQuery({
    queryKey: ['facilityOptions'],
    queryFn: getFacilityOptions,
  });

  const [showCategoryOther, setShowCategoryOther] = useState(false);

  useEffect(() => {
    const categories = form.values.observation_categories || [];
    setShowCategoryOther(categories.includes('other'));
  }, [form.values.observation_categories]);

  return (
    <Stack gap="md">
      {/* 🔹 A. General Information */}
      <FormSection title="A. General Information (Informasi Umum)">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DatePickerInput
              label="Observation Date"
              placeholder="Select date"
              {...form.getInputProps('observation_date')}
              valueFormat="DD/MM/YYYY"
              required
              popoverProps={{ zIndex: 2001 }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TimePicker
              label="Observation Time"
              {...form.getInputProps('observation_time')}
              required
              format="24h"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Location / Area"
              placeholder="e.g. Warehouse A"
              {...form.getInputProps('location_area')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Department / Unit"
              placeholder="e.g. Logistics"
              {...form.getInputProps('department_unit')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 12 }}>
            <Select
              label="Facility (Optional)"
              placeholder="Select facility"
              data={facilityOptions || []}
              {...form.getInputProps('facility_id')}
              searchable
              clearable
              disabled={loadingOptions}
              comboboxProps={{ zIndex: 2001 }}
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 B. Reporter Data */}
      <FormSection title="B. Reporter Data (Data Pelapor)">
        <TextInput
          label="Contact Info (Optional)"
          placeholder="Phone number or email"
          {...form.getInputProps('contact_info')}
        />
      </FormSection>

      {/* 🔹 C. Observation Type */}
      <FormSection title="C. Observation Type (Jenis Observasi)">
        <Checkbox.Group {...form.getInputProps('observation_types')}>
          <Stack gap="xs">
            {OBSERVATION_TYPES.map((type) => (
              <Checkbox key={type.value} value={type.value} label={type.label} />
            ))}
          </Stack>
        </Checkbox.Group>
      </FormSection>

      {/* 🔹 D. Observation Category */}
      <FormSection title="D. Observation Category (Kategori Observasi)">
        <Checkbox.Group {...form.getInputProps('observation_categories')}>
          <Stack gap="xs">
            {OBSERVATION_CATEGORIES.map((category) => (
              <Checkbox key={category.value} value={category.value} label={category.label} />
            ))}
          </Stack>
        </Checkbox.Group>
        {showCategoryOther && (
          <TextInput
            label="Other Category Details"
            placeholder="Specify other category..."
            {...form.getInputProps('category_other')}
            mt="sm"
          />
        )}
      </FormSection>

      {/* 🔹 E. Observation Description */}
      <FormSection title="E. Observation Description (Deskripsi Observasi)">
        <Textarea
          label="Description"
          placeholder="Describe what you observed..."
          {...form.getInputProps('observation_description')}
          minRows={3}
          required
        />
      </FormSection>

      {/* 🔹 F. Potential Risk/Impact */}
      <FormSection title="F. Potential Risk/Impact (Potensi Risiko / Dampak)">
        <Checkbox.Group {...form.getInputProps('potential_impacts')}>
          <Stack gap="xs">
            {POTENTIAL_IMPACTS.map((impact) => (
              <Checkbox key={impact.value} value={impact.value} label={impact.label} />
            ))}
          </Stack>
        </Checkbox.Group>
        <Textarea
          label="Impact Explanation"
          placeholder="Brief explanation of the impact..."
          {...form.getInputProps('impact_explanation')}
          mt="sm"
          minRows={2}
        />
      </FormSection>

      {/* 🔹 G. Suggested Corrective Action */}
      <FormSection title="G. Suggested Corrective Action (Tindakan Perbaikan yang Disarankan)">
        <Textarea
          label="Suggestion"
          placeholder="What should be done?"
          {...form.getInputProps('suggested_corrective_action')}
          minRows={3}
        />
      </FormSection>

      {/* 🔹 H. Immediate Action */}
      <FormSection title="H. Immediate Action (Tindakan Langsung)">
        <Select
          label="Immediate Action Taken?"
          placeholder="Select status"
          data={[
            { value: 'sudah_dilakukan', label: 'Sudah Dilakukan' },
            { value: 'belum_dilakukan', label: 'Belum Dilakukan' },
          ]}
          {...form.getInputProps('immediate_action_done')}
          mb="sm"
        />
        <Textarea
          label="Description of Immediate Action"
          placeholder="If action was taken, describe it..."
          {...form.getInputProps('immediate_action_description')}
          minRows={2}
        />
      </FormSection>

      {/* 🔹 I. Supporting Evidence */}
      <FormSection title="I. Supporting Evidence (Foto / Bukti Pendukung)">
        <Select
          label="Evidence Status"
          placeholder="Select status"
          data={[
            { value: 'terlampir', label: 'Terlampir' },
            { value: 'tidak_ada', label: 'Tidak Ada' },
          ]}
          {...form.getInputProps('has_supporting_evidence')}
          mb="sm"
        />
        <ImageUpload
          name="photo_file_ids"
          title="Photos"
          multiple
          description="Upload photos of the observation"
        />
      </FormSection>
    </Stack>
  );
}

type FormProps = {
  onSubmit: () => void;
};

export function CreateSafetyObservationForm({ onSubmit }: FormProps) {
  const { mutate: createObservation, isPending } = useCreateSafetyObservation();
  
  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(SafetyObservationCreate),
    initialValues: {
      observation_date: normalizeDate(new Date()),
      observation_time: new Date().toTimeString().slice(0, 5),
      location_area: '',
      department_unit: '',
      facility_id: null,
      contact_info: '',
      observation_types: [],
      observation_categories: [],
      category_other: '',
      observation_description: '',
      potential_impacts: [],
      impact_explanation: '',
      suggested_corrective_action: '',
      immediate_action_done: '',
      immediate_action_description: '',
      has_supporting_evidence: '',
      photo_file_ids: [],
    },
  });

  const fileIdManager = useFileIdManager();
  const { updateFilesMetadata } = fileIdManager;

  const handleSubmit = form.onSubmit((values: any) => {
    createObservation(values, {
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
          <SafetyObservationForm form={form} />
          <Group justify="flex-end">
            <Button
              type="submit"
              loading={isPending}
              mt="md"
              leftSection={<IconPlus size={16} stroke={5} />}
            >
              Submit Observation
            </Button>
          </Group>
        </Stack>
      </FileIdProvider>
    </FormProvider>
  );
}

interface EditSafetyObservationFormProps extends FormProps {
  id: string;
}

export function EditSafetyObservationForm({ onSubmit, id }: EditSafetyObservationFormProps) {
  const { mutate: updateObservation, isPending } = useUpdateSafetyObservation();
  const { data, isLoading } = useSafetyObservation(id);

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(SafetyObservationUpdate),
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        ...data,
        observation_date: new Date(data.observation_date),
      });
    }
  }, [data]);

  const fileIdManager = useFileIdManager();
  const { updateFilesMetadata } = fileIdManager;

  const handleSubmit = form.onSubmit((values: any) => {
    updateObservation(
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
          <SafetyObservationForm form={form} />
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

interface ResolveSafetyObservationFormProps extends FormProps {
  id: string;
}

export function ResolveSafetyObservationForm({
  onSubmit,
  id,
}: ResolveSafetyObservationFormProps) {
  const { mutate: resolveObservation, isPending } = useResolveSafetyObservation();
  const { data: observation, isLoading } = useSafetyObservation(id);

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(SafetyObservationResolve),
    initialValues: {
      resolution_notes: '',
    },
  });

  const handleSubmit = form.onSubmit((values: any) => {
    resolveObservation(
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
        <FormSection title="Observation Details">
          <Text size="sm">
            <strong>Description:</strong> {observation?.observation_description}
          </Text>
          <Text size="sm">
            <strong>Date:</strong>{' '}
            {observation?.observation_date
              ? new Date(observation.observation_date).toLocaleDateString()
              : '-'}
          </Text>
        </FormSection>

        <FormSection title="Resolution Notes (HSE)">
          <Textarea
            name="resolution_notes"
            label="Resolution Notes"
            placeholder="Describe how this observation was resolved..."
            {...form.getInputProps('resolution_notes')}
            minRows={4}
            required
            description="Provide detailed information about the resolution actions taken"
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

interface CloseSafetyObservationFormProps extends FormProps {
  id: string;
}

export function CloseSafetyObservationForm({
  onSubmit,
  id,
}: CloseSafetyObservationFormProps) {
  const { mutate: closeObservation, isPending } = useCloseSafetyObservation();
  const { data: observation, isLoading } = useSafetyObservation(id);

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(SafetyObservationClose),
    initialValues: {
      close_reason: '',
    },
  });

  const handleSubmit = form.onSubmit((values: any) => {
    closeObservation(
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
        <FormSection title="Observation Details">
          <Text size="sm">
            <strong>Description:</strong> {observation?.observation_description}
          </Text>
          <Text size="sm">
            <strong>Date:</strong>{' '}
            {observation?.observation_date
              ? new Date(observation.observation_date).toLocaleDateString()
              : '-'}
          </Text>
        </FormSection>

        <FormSection title="Close Reason (HSE/Manager)">
          <Textarea
            name="close_reason"
            label="Reason for Closing"
            placeholder="Why is this observation being closed as invalid?"
            {...form.getInputProps('close_reason')}
            minRows={4}
            required
            description="Provide a reason for closing this observation without resolution"
          />
        </FormSection>

        <Group justify="flex-end">
          <Button
            type="submit"
            loading={isPending}
            color="red"
            leftSection={<IconBan size={16} stroke={2} />}
          >
            Close Observation
          </Button>
        </Group>
      </Stack>
    </FormProvider>
  );
}
