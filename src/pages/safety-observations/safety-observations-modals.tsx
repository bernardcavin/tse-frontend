import { FormSection } from '@/components/form-section';
import { CarouselImageAttachment } from '@/components/image-attachment';
import { useGetSafetyObservation } from '@/hooks/api/safety-observations';
import { Badge, Divider, Grid, Group, Loader, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
    CloseSafetyObservationForm,
    CreateSafetyObservationForm,
    EditSafetyObservationForm,
    ResolveSafetyObservationForm,
} from './safety-observations-forms';

interface ViewSafetyObservationProps {
  id: string;
}

export function ViewSafetyObservation({ id }: ViewSafetyObservationProps) {
  const { data, isLoading } = useGetSafetyObservation({ route: { id } });

  if (isLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader size="lg" />
      </Group>
    );
  }

  if (!data) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No observation data found.
      </Text>
    );
  }

  const observation = data;

  return (
    <Stack gap="lg">
      {/* 🔹 Photos */}
      {observation.photo_file_ids && observation.photo_file_ids.length > 0 && (
        <FormSection title="Photos">
          <CarouselImageAttachment file_ids={observation.photo_file_ids} alt="Safety Observation" />
        </FormSection>
      )}

      {/* 🔹 A. General Information */}
      <FormSection title="A. General Information">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field
              label="Observation Date"
              value={new Date(observation.observation_date).toLocaleDateString()}
            />
            <Field label="Observation Time" value={observation.observation_time} />
            <Field label="Location / Area" value={observation.location_area} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Department / Unit" value={observation.department_unit} />
            <Field label="Facility" value={observation.facility_name || observation.facility_id} />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 B. Reporter Data */}
      <FormSection title="B. Reporter Data">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Observer" value={observation.observer_name || observation.observer_id} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Contact Info" value={observation.contact_info} />
          </Grid.Col>
        </Grid>
      </FormSection>

      {/* 🔹 C. Observation Type */}
      <FormSection title="C. Observation Type">
        <Field
          label="Types"
          value={
            observation.observation_types && observation.observation_types.length > 0 ? (
              <Group gap={4}>
                {observation.observation_types.map((type, idx) => (
                  <Badge key={idx}>{type}</Badge>
                ))}
              </Group>
            ) : (
              '-'
            )
          }
        />
      </FormSection>

      {/* 🔹 D. Observation Category */}
      <FormSection title="D. Observation Category">
        <Field
          label="Categories"
          value={
            observation.observation_categories && observation.observation_categories.length > 0 ? (
              <Group gap={4}>
                {observation.observation_categories.map((cat, idx) => (
                  <Badge key={idx} color="blue">
                    {cat}
                  </Badge>
                ))}
              </Group>
            ) : (
              '-'
            )
          }
        />
        {observation.category_other && (
          <Field label="Other Category Details" value={observation.category_other} />
        )}
      </FormSection>

      {/* 🔹 E. Observation Description */}
      <FormSection title="E. Observation Description">
        <Field label="Description" value={observation.observation_description} />
      </FormSection>

      {/* 🔹 F. Potential Risk/Impact */}
      <FormSection title="F. Potential Risk/Impact">
        <Field
          label="Potential Impacts"
          value={
            observation.potential_impacts && observation.potential_impacts.length > 0 ? (
              <Group gap={4}>
                {observation.potential_impacts.map((impact, idx) => (
                  <Badge key={idx} color="orange">
                    {impact}
                  </Badge>
                ))}
              </Group>
            ) : (
              '-'
            )
          }
        />
        {observation.impact_explanation && (
          <Field label="Impact Explanation" value={observation.impact_explanation} />
        )}
      </FormSection>

      {/* 🔹 G. Suggested Corrective Action */}
      <FormSection title="G. Suggested Corrective Action">
        <Field label="Suggestion" value={observation.suggested_corrective_action} />
      </FormSection>

      {/* 🔹 H. Immediate Action */}
      <FormSection title="H. Immediate Action">
        <Field
          label="Action Taken?"
          value={observation.immediate_action_done === 'sudah_dilakukan' ? 'Yes' : 'No'}
        />
        {observation.immediate_action_description && (
          <Field label="Action Description" value={observation.immediate_action_description} />
        )}
      </FormSection>

      {/* 🔹 I. Supporting Evidence */}
      <FormSection title="I. Supporting Evidence">
        <Field
          label="Evidence Status"
          value={observation.has_supporting_evidence === 'terlampir' ? 'Attached' : 'None'}
        />
      </FormSection>

      {/* Resolution Information */}
      {observation.status === 'resolved' && (
        <FormSection title="Resolution Information">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Field
                label="Resolved By"
                value={observation.resolved_by_name || observation.resolved_by_id || 'N/A'}
              />
              <Field
                label="Resolved At"
                value={
                  observation.resolved_at ? new Date(observation.resolved_at).toLocaleString() : '-'
                }
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Field label="Resolution Notes" value={observation.resolution_notes} />
            </Grid.Col>
            {observation.resolution_photo_file_ids && observation.resolution_photo_file_ids.length > 0 && (
              <Grid.Col span={12}>
                <Text c="dimmed" fz="sm" mb={4}>Resolution Photos</Text>
                <CarouselImageAttachment file_ids={observation.resolution_photo_file_ids} alt="Resolution Evidence" />
              </Grid.Col>
            )}
          </Grid>
        </FormSection>
      )}

      {/* Close Information */}
      {observation.status === 'closed' && (
        <FormSection title="Close Information">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Field
                label="Closed By"
                value={observation.closed_by_name || observation.closed_by_id || 'N/A'}
              />
              <Field
                label="Closed At"
                value={
                  observation.closed_at ? new Date(observation.closed_at).toLocaleString() : '-'
                }
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Field label="Close Reason" value={observation.close_reason} />
            </Grid.Col>
          </Grid>
        </FormSection>
      )}
    </Stack>
  );
}

// 🔸 Field helper
function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null | React.ReactNode;
}) {
  return (
    <Stack gap={2} mb="sm">
      <Text c="dimmed" fz="sm">
        {label}
      </Text>
      <Text fw={500} style={{ wordBreak: 'break-word' }}>
        {value ?? '-'}
      </Text>
      <Divider my={4} />
    </Stack>
  );
}

export function openSafetyObservationCreate(refetch: () => void) {
  modals.open({
    title: 'Add New Safety Observation',
    children: (
      <CreateSafetyObservationForm
        onSubmit={() => {
          refetch();
          modals.closeAll();
        }}
      />
    ),
    size: '75rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openSafetyObservationEdit(id: string, refetch: () => void) {
  modals.open({
    title: 'Edit Safety Observation',
    children: (
      <EditSafetyObservationForm
        id={id}
        onSubmit={() => {
          refetch();
          modals.closeAll();
        }}
      />
    ),
    size: '75rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openSafetyObservationView(id: string) {
  modals.open({
    title: 'View Safety Observation',
    children: <ViewSafetyObservation id={id} />,
    size: '75rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openSafetyObservationResolve(id: string, refetch: () => void) {
  modals.open({
    title: 'Resolve Safety Observation',
    children: (
      <ResolveSafetyObservationForm
        id={id}
        onSubmit={() => {
          refetch();
          modals.closeAll();
        }}
      />
    ),
    size: '50rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openSafetyObservationClose(id: string, refetch: () => void) {
  modals.open({
    title: 'Close Safety Observation (Invalid)',
    children: (
      <CloseSafetyObservationForm
        id={id}
        onSubmit={() => {
          refetch();
          modals.closeAll();
        }}
      />
    ),
    size: '50rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}
