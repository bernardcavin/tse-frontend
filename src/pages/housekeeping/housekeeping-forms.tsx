import {
  ChecklistItemType,
  HousekeepingCreate,
  HousekeepingCreateType,
} from '@/api/entities/housekeeping';
import { getFacilityOptions } from '@/api/resources/facilities';
import { FormSection } from '@/components/form-section';
import { FormProvider } from '@/components/forms/form-provider';
import {
  useCreateHousekeeping,
  useEditHousekeeping,
  useGetHousekeeping,
} from '@/hooks/api/housekeeping';
import { normalizeDate } from '@/utilities/date';
import { handleFormErrors } from '@/utilities/form';
import {
  Button,
  Divider,
  Grid,
  Group,
  Loader,
  Radio,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';

const SECTION_A_ITEMS = [
  'Lantai bersih dari debu, minyak, dan kotoran',
  'Tidak ada sampah berserakan',
  'Tempat sampah tersedia dan tertutup',
  'Sampah dipilah sesuai jenisnya',
  'Area kerja bebas dari bau tidak sedap',
];

const SECTION_B_ITEMS = [
  'Peralatan kerja tersusun rapi',
  'Barang disimpan di tempat yang telah ditentukan',
  'Tidak ada barang menumpuk di lantai',
  'Jalur pejalan kaki bebas hambatan',
  'Rak / lemari diberi label',
];

const SECTION_C_ITEMS = [
  'APAR mudah diakses dan tidak terhalang',
  'Jalur evakuasi jelas dan tidak tertutup',
  'Rambu K3 terpasang dan terbaca',
  'Kabel listrik tertata dan tidak rusak',
  'Tidak ada potensi slip, trip, dan fall',
];

const SECTION_D_ITEMS = [
  'Toilet bersih dan berfungsi',
  'Wastafel dan saluran air lancar',
  'Sabun dan tisu tersedia',
  'Area pantry bersih dan rapi',
  'Meja dan kursi dalam kondisi bersih',
];

interface SectionProps {
  title: string;
  letter: string;
  items: ChecklistItemType[];
  onItemChange: (index: number, status: string, notes?: string | null) => void;
}

function ChecklistSection({ title, letter, items, onItemChange }: SectionProps) {
  return (
    <Stack gap="sm">
      <Title order={5}>
        {letter}. {title}
      </Title>
      {items.map((item, index) => (
        <Stack key={index} gap="xs">
          <Group gap="xs">
            <Text size="sm" fw={500}>
              {index + 1}.
            </Text>
            <Text size="sm" style={{ flex: 1 }}>
              {item.item}
            </Text>
          </Group>
          <Group gap="md" ml="lg">
            <Radio.Group
              value={item.status || ''}
              onChange={(value) => onItemChange(index, value, item.notes)}
            >
              <Group gap="md">
                <Radio value="✔" label="✔ Baik/Sesuai" />
                <Radio value="✖" label="✖ Tidak Sesuai" />
                <Radio value="N/A" label="N/A" />
              </Group>
            </Radio.Group>
          </Group>
          <TextInput
            placeholder="Keterangan (optional)"
            value={item.notes || ''}
            onChange={(e) => onItemChange(index, item.status || '', e.currentTarget.value)}
            ml="lg"
            size="sm"
          />
        </Stack>
      ))}
    </Stack>
  );
}

interface HousekeepingFormProps {
  form: any;
}

export function HousekeepingForm({ form }: HousekeepingFormProps) {
  const { data: facilityOptions, isLoading: loadingOptions } = useQuery({
    queryKey: ['facilityOptions'],
    queryFn: getFacilityOptions,
  });

  const handleSectionChange = (
    section: 'section_a_items' | 'section_b_items' | 'section_c_items' | 'section_d_items',
    index: number,
    status: string,
    notes?: string | null
  ) => {
    const items = [...form.values[section]];
    items[index] = {
      ...items[index],
      status: status || null,
      notes: notes || '',
    };
    form.setFieldValue(section, items);
  };

  return (
    <Stack gap="md">
      {/* Basic Information */}
      <FormSection title="FORM CHECKLIST HOUSEKEEPING">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Lokasi / Area"
              placeholder="Enter location or area"
              required
              {...form.getInputProps('location_area')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DatePickerInput
              label="Tanggal"
              placeholder="Select date"
              required
              {...form.getInputProps('inspection_date')}
              valueFormat="DD/MM/YYYY"
              popoverProps={{ zIndex: 2001 }}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Petugas / Inspector"
              placeholder="Enter inspector name"
              required
              {...form.getInputProps('inspector_name')}
            />
          </Grid.Col>

          <Grid.Col span={12}>
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

      <Divider />

      <Text size="sm" c="dimmed">
        Keterangan: ✔ = Baik / Sesuai &nbsp;&nbsp; ✖ = Tidak Sesuai &nbsp;&nbsp; N/A = Tidak
        Berlaku
      </Text>

      {/* Section A */}
      <ChecklistSection
        title="KEBERSIHAN AREA KERJA"
        letter="A"
        items={form.values.section_a_items}
        onItemChange={(index, status, notes) =>
          handleSectionChange('section_a_items', index, status, notes)
        }
      />

      <Divider />

      {/* Section B */}
      <ChecklistSection
        title="PENATAAN BARANG & PERALATAN"
        letter="B"
        items={form.values.section_b_items}
        onItemChange={(index, status, notes) =>
          handleSectionChange('section_b_items', index, status, notes)
        }
      />

      <Divider />

      {/* Section C */}
      <ChecklistSection
        title="KESELAMATAN & K3"
        letter="C"
        items={form.values.section_c_items}
        onItemChange={(index, status, notes) =>
          handleSectionChange('section_c_items', index, status, notes)
        }
      />

      <Divider />

      {/* Section D */}
      <ChecklistSection
        title="KEBERSIHAN FASILITAS UMUM"
        letter="D"
        items={form.values.section_d_items}
        onItemChange={(index, status, notes) =>
          handleSectionChange('section_d_items', index, status, notes)
        }
      />

      <Divider />

      {/* Additional Notes */}
      <Textarea
        label="Catatan Tambahan"
        placeholder="Enter additional notes..."
        {...form.getInputProps('additional_notes')}
        minRows={3}
      />
    </Stack>
  );
}

type FormProps = {
  onSubmit: () => void;
};

export function CreateHousekeepingForm({ onSubmit }: FormProps) {
  const { mutate: createHousekeeping, isPending } = useCreateHousekeeping();

  const form = useForm<HousekeepingCreateType>({
    mode: 'controlled',
    validate: zodResolver(HousekeepingCreate),
    initialValues: {
      location_area: '',
      inspection_date: normalizeDate(new Date()),
      inspector_name: '',
      facility_id: null,
      section_a_items: SECTION_A_ITEMS.map((item) => ({ item, status: null, notes: '' })),
      section_b_items: SECTION_B_ITEMS.map((item) => ({ item, status: null, notes: '' })),
      section_c_items: SECTION_C_ITEMS.map((item) => ({ item, status: null, notes: '' })),
      section_d_items: SECTION_D_ITEMS.map((item) => ({ item, status: null, notes: '' })),
      additional_notes: '',
    },
  });

  const handleSubmit = form.onSubmit((values: any) => {
    createHousekeeping({ variables: values }, {
      onError: (error) => handleFormErrors(form, error),
      onSuccess: () => {
        onSubmit();
      },
    });
  });

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <Stack>
        <HousekeepingForm form={form} />
        <Group justify="flex-end">
          <Button
            type="submit"
            loading={isPending}
            mt="md"
            leftSection={<IconPlus size={16} stroke={5} />}
          >
            Create Checklist
          </Button>
        </Group>
      </Stack>
    </FormProvider>
  );
}

interface EditHousekeepingFormProps extends FormProps {
  id: string;
}

export function EditHousekeepingForm({ onSubmit, id }: EditHousekeepingFormProps) {
  const { mutate: updateHousekeeping, isPending } = useEditHousekeeping();
  const { data, isLoading } = useGetHousekeeping({ route: { id } });

  const form = useForm<HousekeepingCreateType>({
    mode: 'controlled',
    validate: zodResolver(HousekeepingCreate),
    initialValues: {
      location_area: '',
      inspection_date: normalizeDate(new Date()),
      inspector_name: '',
      facility_id: null,
      section_a_items: SECTION_A_ITEMS.map((item) => ({ item, status: null, notes: '' })),
      section_b_items: SECTION_B_ITEMS.map((item) => ({ item, status: null, notes: '' })),
      section_c_items: SECTION_C_ITEMS.map((item) => ({ item, status: null, notes: '' })),
      section_d_items: SECTION_D_ITEMS.map((item) => ({ item, status: null, notes: '' })),
      additional_notes: '',
    },
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        location_area: data.location_area || '',
        inspection_date: new Date(data.inspection_date),
        inspector_name: data.inspector_name || '',
        facility_id: data.facility_id || null,
        section_a_items: (data.section_a_items ||
          SECTION_A_ITEMS.map((item) => ({ item, status: null, notes: '' }))) as any,
        section_b_items: (data.section_b_items ||
          SECTION_B_ITEMS.map((item) => ({ item, status: null, notes: '' }))) as any,
        section_c_items: (data.section_c_items ||
          SECTION_C_ITEMS.map((item) => ({ item, status: null, notes: '' }))) as any,
        section_d_items: (data.section_d_items ||
          SECTION_D_ITEMS.map((item) => ({ item, status: null, notes: '' }))) as any,
        additional_notes: data.additional_notes || '',
      });
    }
  }, [data]);

  const handleSubmit = form.onSubmit((values: any) => {
    updateHousekeeping(
      { route: { id }, variables: values },
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
        <HousekeepingForm form={form} />
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
    </FormProvider>
  );
}
