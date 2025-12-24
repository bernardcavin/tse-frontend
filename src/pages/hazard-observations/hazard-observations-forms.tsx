import {
  HazardObservationCreate,
  HazardObservationResolve,
  HazardObservationUpdate
} from '@/api/entities/hazard-observations';
import { getFacilityOptions } from '@/api/resources/facilities';
import {
  useCreateHazardObservation,
  useHazardObservation,
  useResolveHazardObservation,
  useUpdateHazardObservation,
} from '@/api/resources/hazard-observations';
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
import { IconCheck, IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useEffect, useState } from 'react';

const HAZARD_TYPES = [
  { value: 'physical', label: 'Physical (Fisik)' },
  { value: 'chemical', label: 'Chemical (Kimia)' },
  { value: 'biological', label: 'Biological (Biologi)' },
  { value: 'ergonomic', label: 'Ergonomic (Ergonomi)' },
  { value: 'psychosocial', label: 'Psychosocial (Psikososial)' },
];

const POTENTIAL_RISKS = [
  { value: 'hit_by_object', label: 'Hit by Object (Menabrak/Ditabrak)' },
  { value: 'slip_trip_fall', label: 'Slip/Trip/Fall (Terpeleset/Tersandung/Terjatuh)' },
  { value: 'short_circuit_burn', label: 'Short Circuit/Burn (Arus Pendek/Terbakar)' },
  { value: 'contact_hazard', label: 'Contact Hazard (Kontak Panas/Listrik/Kimia)' },
  { value: 'environmental_pollution', label: 'Environmental Pollution (Pencemaran)' },
  { value: 'other', label: 'Other (Lain-Lain)' },
];

const UNSAFE_REASONS = [
  { value: 'inadequate_equipment', label: 'Inadequate Equipment (Peralatan Tidak Memadai)' },
  { value: 'lack_of_knowledge', label: 'Lack of Knowledge (Kurang Pengetahuan)' },
  { value: 'incorrect_ppe_use', label: 'Incorrect PPE Use (Penggunaan APD Tidak Tepat)' },
  { value: 'procedure_violation', label: 'Procedure Violation (Melanggar Prosedur)' },
  { value: 'other', label: 'Other (Lain-Lain)' },
];

const CONTROL_MEASURES = [
  { value: 'elimination', label: 'Elimination (Eliminasi)' },
  { value: 'substitution', label: 'Substitution (Substitusi)' },
  { value: 'minimization', label: 'Minimization (Minimalisasi)' },
  { value: 'training', label: 'Training (Pelatihan)' },
  { value: 'ppe', label: 'PPE / APD (Alat Pelindung Diri)' },
  { value: 'other', label: 'Other (Lain-Lain)' },
];

interface HazardObservationFormProps {
  form: any;
}

export function HazardObservationForm({ form }: HazardObservationFormProps) {
  const { data: facilityOptions, isLoading: loadingOptions } = useQuery({
    queryKey: ['facilityOptions'],
    queryFn: getFacilityOptions,
  });

  const [showPotentialRiskOther, setShowPotentialRiskOther] = useState(false);
  const [showUnsafeReasonOther, setShowUnsafeReasonOther] = useState(false);
  const [showControlMeasureOther, setShowControlMeasureOther] = useState(false);

  useEffect(() => {
    const potentialRisks = form.values.potential_risks || [];
    setShowPotentialRiskOther(potentialRisks.includes('other'));
  }, [form.values.potential_risks]);

  useEffect(() => {
    const unsafeReasons = form.values.unsafe_reasons || [];
    setShowUnsafeReasonOther(unsafeReasons.includes('other'));
  }, [form.values.unsafe_reasons]);

  useEffect(() => {
    const controlMeasures = form.values.control_measures || [];
    setShowControlMeasureOther(controlMeasures.includes('other'));
  }, [form.values.control_measures]);

  return (
    <Stack gap="md">
      {/* 🔹 Photos */}
      <ImageUpload
        name="photo_file_ids"
        title="Photos"
        multiple
        description="Upload photos of the hazard observation"
      />

      {/* 🔹 Observer Information */}
      <FormSection title="Observer Information (Informasi Pengamat)">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Facility"
              placeholder="Select facility"
              data={facilityOptions || []}
              {...form.getInputProps('facility_id')}
              searchable
              required
              disabled={loadingOptions}
              comboboxProps={{ zIndex: 2001 }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <DatePickerInput
              label="Observation Date"
              placeholder="Select date"
              {...form.getInputProps('observation_date')}
              valueFormat="DD/MM/YYYY"
              required
              popoverProps={{ zIndex: 2001 }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <TimePicker
              label="Observation Time"
              {...form.getInputProps('observation_time')}
              required
              format='24h'
              
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 Unsafe Action/Condition */}
      <FormSection title="Unsafe Action/Condition (Tindakan/Kondisi Tidak Aman)">
        <Textarea
          label="Description"
          placeholder="Describe the unsafe action or condition observed..."
          {...form.getInputProps('unsafe_action_condition')}
          minRows={3}
          required
        />
      </FormSection>

      {/* 🔹 Hazard Types (Bahaya) */}
      <FormSection title="Hazard Types (Bahaya)">
        <Checkbox.Group {...form.getInputProps('hazard_types')}>
          <Stack gap="xs">
            {HAZARD_TYPES.map((type) => (
              <Checkbox key={type.value} value={type.value} label={type.label} />
            ))}
          </Stack>
        </Checkbox.Group>
      </FormSection>

      {/* 🔹 Potential Risks (Resiko Potensial) */}
      <FormSection title="Potential Risks (Resiko Potensial)">
        <Checkbox.Group {...form.getInputProps('potential_risks')}>
          <Stack gap="xs">
            {POTENTIAL_RISKS.map((risk) => (
              <Checkbox key={risk.value} value={risk.value} label={risk.label} />
            ))}
          </Stack>
        </Checkbox.Group>
        {showPotentialRiskOther && (
          <TextInput
            label="Other Potential Risk Details"
            placeholder="Specify other potential risk..."
            {...form.getInputProps('potential_risk_other')}
            mt="sm"
          />
        )}
      </FormSection>

      {/* 🔹 Why Unsafe (Mengapa Tidak Aman) */}
      <FormSection title="Why Unsafe? (Mengapa Pekerjaan Ini Dilakukan Tidak Aman)">
        <Checkbox.Group {...form.getInputProps('unsafe_reasons')}>
          <Stack gap="xs">
            {UNSAFE_REASONS.map((reason) => (
              <Checkbox key={reason.value} value={reason.value} label={reason.label} />
            ))}
          </Stack>
        </Checkbox.Group>
        {showUnsafeReasonOther && (
          <TextInput
            label="Other Unsafe Reason Details"
            placeholder="Specify other reason..."
            {...form.getInputProps('unsafe_reason_other')}
            mt="sm"
          />
        )}
      </FormSection>

      {/* 🔹 Control Measures (Pengendalian) */}
      <FormSection title="Control Measures (Pengendalian yang Dilakukan)">
        <Checkbox.Group {...form.getInputProps('control_measures')}>
          <Stack gap="xs">
            {CONTROL_MEASURES.map((measure) => (
              <Checkbox key={measure.value} value={measure.value} label={measure.label} />
            ))}
          </Stack>
        </Checkbox.Group>
        {showControlMeasureOther && (
          <TextInput
            label="Other Control Measure Details"
            placeholder="Specify other control measure..."
            {...form.getInputProps('control_measure_other')}
            mt="sm"
          />
        )}
      </FormSection>

      {/* 🔹 Corrective Action */}
      <FormSection title="Corrective Action (Tindakan Perbaikan/Saran)">
        <Textarea
          label="Corrective Action or Suggestions"
          placeholder="Describe corrective actions taken or suggested..."
          {...form.getInputProps('corrective_action')}
          minRows={3}
        />
      </FormSection>
    </Stack>
  );
}

type FormProps = {
  onSubmit: () => void;
};

export function CreateHazardObservationForm({ onSubmit }: FormProps) {
  const { mutate: createObservation, isPending } = useCreateHazardObservation();
  
  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(HazardObservationCreate),
    initialValues: {
      facility_id: '',
      observation_date: normalizeDate(new Date()),
      observation_time: new Date().toTimeString().slice(0, 5),
      unsafe_action_condition: '',
      hazard_types: [],
      potential_risks: [],
      potential_risk_other: '',
      unsafe_reasons: [],
      unsafe_reason_other: '',
      control_measures: [],
      control_measure_other: '',
      corrective_action: '',
    },
  });

  const fileIdManager = useFileIdManager();
  const { updateFilesMetadata } = fileIdManager;

  const handleSubmit = form.onSubmit((values: any) => {
    console.log(values)
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
          <HazardObservationForm form={form} />
          <Group justify="flex-end">
            <Button
              type="submit"
              loading={isPending}
              mt="md"
              leftSection={<IconPlus size={16} stroke={5} />}
            >
              Add Observation
            </Button>
          </Group>
        </Stack>
      </FileIdProvider>
    </FormProvider>
  );
}

interface EditHazardObservationFormProps extends FormProps {
  id: string;
}

export function EditHazardObservationForm({ onSubmit, id }: EditHazardObservationFormProps) {
  const { mutate: updateObservation, isPending } = useUpdateHazardObservation();
  const { data, isLoading } = useHazardObservation(id);

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(HazardObservationUpdate),
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
          <HazardObservationForm form={form} />
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

interface ResolveHazardObservationFormProps extends FormProps {
  id: string;
}

export function ResolveHazardObservationForm({
  onSubmit,
  id,
}: ResolveHazardObservationFormProps) {
  const { mutate: resolveObservation, isPending } = useResolveHazardObservation();
  const { data: observation, isLoading } = useHazardObservation(id);

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(HazardObservationResolve),
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
            <strong>Facility:</strong> {observation?.facility_id}
          </Text>
          <Text size="sm">
            <strong>Date:</strong>{' '}
            {observation?.observation_date
              ? new Date(observation.observation_date).toLocaleDateString()
              : '-'}
          </Text>
          <Text size="sm">
            <strong>Unsafe Condition:</strong> {observation?.unsafe_action_condition}
          </Text>
        </FormSection>

        <FormSection title="Resolution Notes (HSE)">
          <Textarea
            name="resolution_notes"
            label="Resolution Notes"
            placeholder="Describe how this hazard was resolved..."
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
