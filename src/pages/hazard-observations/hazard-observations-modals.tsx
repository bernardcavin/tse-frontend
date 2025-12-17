import { useHazardObservation } from '@/api/resources/hazard-observations';
import { FormSection } from '@/components/form-section';
import {
  Badge,
  Divider,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  CreateHazardObservationForm,
  EditHazardObservationForm,
  ResolveHazardObservationForm,
} from './hazard-observations-forms';

interface ViewHazardObservationProps {
  id: string;
}

export function ViewHazardObservation({ id }: ViewHazardObservationProps) {
  const { data, isLoading } = useHazardObservation(id);

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
      <FormSection title="Observer Information">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Observer" value={observation.observer_name || observation.observer_id} />
            <Field label="Facility" value={observation.facility_name || observation.facility_id} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field
              label="Observation Date"
              value={new Date(observation.observation_date).toLocaleDateString()}
            />
            <Field label="Observation Time" value={observation.observation_time} />
          </Grid.Col>
        </Grid>
      </FormSection>

      <FormSection title="Observation Details">
        <Field
          label="Unsafe Action/Condition"
          value={observation.unsafe_action_condition}
        />
        <Field
          label="Hazard Types"
          value={
            observation.hazard_types && observation.hazard_types.length > 0 ? (
              <Group gap={4}>
                {observation.hazard_types.map((type, idx) => (
                  <Badge key={idx} >
                    {type}
                  </Badge>
                ))}
              </Group>
            ) : (
              '-'
            )
          }
        />
        <Field
          label="Potential Risks"
          value={
            observation.potential_risks && observation.potential_risks.length > 0 ? (
              <Group gap={4}>
                {observation.potential_risks.map((risk, idx) => (
                  <Badge key={idx}  color="orange">
                    {risk}
                  </Badge>
                ))}
              </Group>
            ) : (
              '-'
            )
          }
        />
        {observation.potential_risk_other && (
          <Field label="Other Potential Risk" value={observation.potential_risk_other} />
        )}
      </FormSection>

      <FormSection title="Why Unsafe">
        <Field
          label="Unsafe Reasons"
          value={
            observation.unsafe_reasons && observation.unsafe_reasons.length > 0 ? (
              <Group gap={4}>
                {observation.unsafe_reasons.map((reason, idx) => (
                  <Badge key={idx}  color="red">
                    {reason}
                  </Badge>
                ))}
              </Group>
            ) : (
              '-'
            )
          }
        />
        {observation.unsafe_reason_other && (
          <Field label="Other Unsafe Reason" value={observation.unsafe_reason_other} />
        )}
      </FormSection>

      <FormSection title="Control Measures">
        <Field
          label="Control Measures"
          value={
            observation.control_measures && observation.control_measures.length > 0 ? (
              <Group gap={4}>
                {observation.control_measures.map((measure, idx) => (
                  <Badge key={idx}  color="green">
                    {measure}
                  </Badge>
                ))}
              </Group>
            ) : (
              '-'
            )
          }
        />
        {observation.control_measure_other && (
          <Field label="Other Control Measure" value={observation.control_measure_other} />
        )}
        <Field label="Corrective Action" value={observation.corrective_action} />
      </FormSection>

      {observation.status === 'resolved' && observation.resolution_notes && (
        <FormSection title="Resolution Information">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Field label="Resolved By" value={observation.resolved_by_name || observation.resolved_by_id || 'N/A'} />
              <Field
                label="Resolved At"
                value={
                  observation.resolved_at
                    ? new Date(observation.resolved_at).toLocaleString()
                    : '-'
                }
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Field label="Resolution Notes" value={observation.resolution_notes} />
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

export function openHazardObservationCreate(refetch: () => void) {
  modals.open({
    title: 'Add New Hazard Observation Card',
    children: (
      <CreateHazardObservationForm
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

export function openHazardObservationEdit(id: string, refetch: () => void) {
  modals.open({
    title: 'Edit Hazard Observation Card',
    children: (
      <EditHazardObservationForm
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

export function openHazardObservationView(id: string) {
  modals.open({
    title: 'View Hazard Observation Card',
    children: <ViewHazardObservation id={id} />,
    size: '75rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openHazardObservationResolve(id: string, refetch: () => void) {
  modals.open({
    title: 'Resolve Hazard Observation',
    children: (
      <ResolveHazardObservationForm
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
