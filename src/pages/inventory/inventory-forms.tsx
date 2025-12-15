import { useEffect, useState } from 'react';
import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { Button, Collapse, Grid, Group, Loader, Radio, SimpleGrid, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Inventory } from '@/api/entities/inventory';
import { getFacilityCoordinates, getFacilityOptions } from '@/api/resources/facilities';
import { DataMultiSelect } from '@/components/data-multi-select';
import { DataSelect } from '@/components/data-select';
import { FormSection } from '@/components/form-section';
import { DatePickerInput, NumberInput, Select } from '@/components/forms';
import { FileUploadButton, ImageUpload } from '@/components/forms/file-upload';
import { FileIdProvider, useFileIdManager } from '@/components/forms/file-upload-provider';
import { FormProvider, useForm as useFormContext } from '@/components/forms/form-provider';
import { Switch } from '@/components/forms/switch';
import { Textarea } from '@/components/forms/text-area';
import { TextInput } from '@/components/forms/text-input';
import { useCreateInventory, useEditInventory, useGetInventory } from '@/hooks/api/inventory';
import { getFieldValue, handleFormErrors } from '@/utilities/form';

export function InventoryForm() {
  const form = useFormContext();
  const [locationStatus, setLocationStatus] = useState<string>('in_storage');
  const [storageLocationId, setStorageLocationId] = useState<string | null>(null);
  form.watch('storage_location_id', ({ value }) => {
    setStorageLocationId(value);
  });

  useEffect(() => {
    form.setFieldValue('location_status', locationStatus);
    if (locationStatus === 'in_storage') {
      const facilityId = getFieldValue('storage_location_id', form);
      getFacilityCoordinates(facilityId).then(({ latitude, longitude }) => {
        form.setFieldValue('current_latitude', latitude);
        form.setFieldValue('current_longitude', longitude);
      });
    }
  }, [locationStatus, storageLocationId]);

  return (
    <Stack gap="md">
      {/* 🔹 Photos */}
      <ImageUpload
        name="photo_file_ids"
        title="Photos"
        multiple
        description="Upload photos of the inventory item"
      />

      {/* 🔹 Basic Information */}
      <FormSection title="Basic Information">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="item_name"
              label="Inventory Name"
              placeholder="e.g. Safety Helmet, Office Chair"
              required
              description="The name of the inventory item"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="item_code"
              label="Item Code"
              placeholder="e.g. INV-2024-001"
              required
              description="Unique identifier for this item"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              name="item_category"
              label="Category"
              placeholder="Select category"
              required
              description="Item classification"
              data={[
                'Safety Equipment',
                'Office Supplies',
                'Tools & Equipment',
                'Furniture',
                'Electronics',
                'Consumables',
                'Raw Materials',
                'Maintenance Supplies',
                'Medical Supplies',
                'Other',
              ]}
              searchable
              comboboxProps={{ zIndex: 2000 }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              name="condition_status"
              label="Condition"
              required
              placeholder="Select condition"
              description="Current physical state"
              comboboxProps={{ zIndex: 2000 }}
              data={[
                'New',
                'Excellent',
                'Good',
                'Fair',
                'Used',
                'Refurbished',
                'Damaged',
                'Needs Repair',
                'Obsolete',
              ]}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              name="item_description"
              label="Description"
              placeholder="Detailed description of the item, specifications, or notes"
              autosize
              minRows={2}
              description="Include any relevant specifications or features"
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      <FormSection title="Stock Management">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberInput
              name="quantity"
              label="Current Quantity"
              placeholder="0"
              required
              min={0}
              description="Current stock on hand"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              name="quantity_uom"
              label="Unit of Measurement"
              placeholder="Select unit"
              required
              description="How this item is measured"
              comboboxProps={{ zIndex: 2000 }}
              data={[
                { value: 'pcs', label: 'Pieces (pcs)' },
                { value: 'box', label: 'Box' },
                { value: 'carton', label: 'Carton' },
                { value: 'kg', label: 'Kilograms (kg)' },
                { value: 'g', label: 'Grams (g)' },
                { value: 'L', label: 'Liters (L)' },
                { value: 'mL', label: 'Milliliters (mL)' },
                { value: 'm', label: 'Meters (m)' },
                { value: 'cm', label: 'Centimeters (cm)' },
                { value: 'set', label: 'Set' },
                { value: 'unit', label: 'Unit' },
                { value: 'roll', label: 'Roll' },
                { value: 'pack', label: 'Pack' },
              ]}
              searchable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberInput
              name="minimum_stock_level"
              required
              label="Minimum Stock Level"
              placeholder="0"
              min={0}
              description="Alert when stock falls below this level"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <NumberInput
              name="reorder_level"
              label="Reorder Level"
              placeholder="0"
              min={0}
              description="Trigger reorder at this quantity"
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      <FormSection title="Location & Assignment">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DataSelect
              required
              name="storage_location_id"
              label="Storage Location"
              placeholder="e.g. Warehouse A, Shelf 3B, Room 205"
              description="Physical location where item is stored"
              dataGetter={getFacilityOptions}
            />
            <Radio.Group
              name="location_status"
              value={locationStatus}
              onChange={(value) => setLocationStatus(value)}
              mt="md"
            >
              <Group>
                <Radio
                  label="In Storage"
                  value="in_storage"
                  description="Item is currently stored"
                />
                <Radio
                  label="In Transit"
                  value="in_transit"
                  description="Item is currently being transported"
                />
              </Group>
            </Radio.Group>

            <Collapse in={locationStatus === 'in_transit'}>
              <SimpleGrid cols={2} mt="md">
                <NumberInput
                  required
                  name="current_latitude"
                  label="Current Latitude"
                  placeholder="e.g. -6.2088"
                  description="Current latitude coordinate"
                  decimalScale={6}
                />
                <NumberInput
                  required
                  name="current_longitude"
                  label="Current Longitude"
                  placeholder="e.g. 106.8456"
                  description="Current longitude coordinate"
                  decimalScale={6}
                />
              </SimpleGrid>
            </Collapse>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="asset_tag"
              label="Asset Tag"
              placeholder="e.g. AT-2024-001"
              description="Physical tag or barcode number"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              name="assigned_department"
              label="Assigned Department"
              placeholder="Select department"
              description="Department responsible for this item"
              comboboxProps={{ zIndex: 2000 }}
              data={[
                'Operations',
                'Maintenance',
                'Safety',
                'Administration',
                'HR',
                'IT',
                'Finance',
                'Procurement',
                'Warehouse',
                'Production',
                'Quality Control',
                'Unassigned',
              ]}
              searchable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="assigned_personnel"
              label="Assigned Personnel"
              placeholder="e.g. John Doe"
              description="Person responsible for this item"
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      <FormSection title="Additional Information" withHide>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="manufacturer"
              label="Manufacturer"
              placeholder="e.g. 3M, ABC Corporation"
              description="Company that manufactured the item"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              name="supplier"
              label="Supplier"
              placeholder="e.g. XYZ Trading Co."
              description="Vendor or supplier"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DatePickerInput
              name="purchase_date"
              label="Purchase Date"
              placeholder="Select date"
              description="Date item was purchased"
              popoverProps={{ zIndex: 2000 }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DatePickerInput
              name="expiry_date"
              label="Expiry Date"
              placeholder="Select date"
              description="Expiration or warranty end date"
              popoverProps={{ zIndex: 2000 }}
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      <FormSection title="Compliance & Safety" withHide>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Switch
              name="inspection_required"
              label="Inspection Required"
              description="Item requires periodic inspection"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Switch
              name="safety_data_sheet_available"
              label="Safety Data Sheet Available"
              description="SDS or MSDS on file"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <DatePickerInput
              name="last_inspection_date"
              label="Last Inspection Date"
              placeholder="Select date"
              description="Most recent inspection"
              popoverProps={{ zIndex: 2000 }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <DatePickerInput
              name="next_inspection_due"
              label="Next Inspection Due"
              placeholder="Select date"
              description="Upcoming inspection date"
              popoverProps={{ zIndex: 2000 }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <DatePickerInput
              name="certification_expiry_date"
              label="Certification Expiry"
              placeholder="Select date"
              description="Certification expiration"
              popoverProps={{ zIndex: 2000 }}
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      <FormSection title="Additional Information" withHide>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Switch
              name="is_active"
              label="Active Status"
              description="Item is currently available"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              name="remarks"
              label="Remarks"
              placeholder="Any additional notes, special handling instructions, or observations"
              autosize
              minRows={2}
              description="Internal notes and comments"
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      <FileUploadButton
        name="attachment_file_ids"
        label="Attachments"
        multiple
        description="Upload related documents (invoices, certificates, manuals, etc.)"
      />
    </Stack>
  );
}

type InventoryFormProps = {
  onSubmit: () => void;
};

export function CreateInventoryForm({ onSubmit }: InventoryFormProps) {
  const { mutate: createInventory, isPending } = useCreateInventory();

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(Inventory),
    initialValues: {
      location_status: 'in_storage',
      minimum_stock_level: 0,
      is_active: true,
    },
  });

  const fileIdManager = useFileIdManager();
  const { fileIds, updateFilesMetadata } = fileIdManager;

  const handleSubmit = form.onSubmit((variables: any) => {
    createInventory(
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
          <InventoryForm />
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

interface EditInventoryFormProps extends InventoryFormProps {
  id: string;
}

export function EditInventoryForm({ onSubmit, id }: EditInventoryFormProps) {
  const { mutate: editInventory, isPending } = useEditInventory({
    route: { id: id },
  });
  const { data, isLoading } = useGetInventory({ route: { id: id } });

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(Inventory),
  });

  useEffect(() => {
    if (data) form.setValues(data);
  }, [data]);

  const fileIdManager = useFileIdManager();
  const { fileIds, updateFilesMetadata } = fileIdManager;

  const handleSubmit = form.onSubmit((variables: any) => {
    editInventory(
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
          <InventoryForm />
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
