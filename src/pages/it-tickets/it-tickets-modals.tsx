import { useITTicket } from '@/api/resources/it-tickets';
import { FormSection } from '@/components/form-section';
import { CarouselImageAttachment } from '@/components/image-attachment';
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
    AssignITTicketForm,
    CreateITTicketForm,
    EditITTicketForm,
    ResolveITTicketForm,
} from './it-tickets-forms';

const STATUS_COLORS: Record<string, string> = {
  open: 'red',
  in_progress: 'yellow',
  resolved: 'green',
  closed: 'gray',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const CATEGORY_LABELS: Record<string, string> = {
  hardware: 'Hardware',
  software: 'Software',
  network: 'Network',
  account_access: 'Account/Access',
  other: 'Other',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  critical: 'red',
};

interface ViewITTicketProps {
  id: string;
}

export function ViewITTicket({ id }: ViewITTicketProps) {
  const { data, isLoading } = useITTicket(id);

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
        No ticket data found.
      </Text>
    );
  }

  const ticket = data;

  return (
    <Stack gap="lg">
      {/* 🔹 Attachments */}
      {ticket.photo_file_ids && ticket.photo_file_ids.length > 0 && (
        <FormSection title="Attachments">
          <CarouselImageAttachment file_ids={ticket.photo_file_ids} alt="IT Ticket" />
        </FormSection>
      )}

      <FormSection title="Ticket Information">
        <Grid>
          <Grid.Col span={12}>
            <Field label="Title" value={ticket.title} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field
              label="Category"
              value={
                <Badge variant="light">
                  {CATEGORY_LABELS[ticket.category] || ticket.category}
                </Badge>
              }
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field
              label="Priority"
              value={
                <Badge color={PRIORITY_COLORS[ticket.priority] || 'gray'}>
                  {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                </Badge>
              }
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field
              label="Status"
              value={
                <Badge color={STATUS_COLORS[ticket.status] || 'gray'}>
                  {STATUS_LABELS[ticket.status] || ticket.status}
                </Badge>
              }
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field
              label="Created At"
              value={ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '-'}
            />
          </Grid.Col>
        </Grid>
      </FormSection>

      <FormSection title="Description">
        <Text style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</Text>
      </FormSection>

      <FormSection title="Reporter & Assignment">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Reporter" value={ticket.reporter_name || ticket.reporter_id} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Facility" value={ticket.facility_name || '-'} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Assigned To" value={ticket.assigned_to_name || 'Not assigned'} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Related Inventory" value={ticket.inventory_item_name || '-'} />
          </Grid.Col>
        </Grid>
      </FormSection>

      {ticket.status === 'resolved' && ticket.resolution_notes && (
        <FormSection title="Resolution Information">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Field label="Resolved By" value={ticket.resolved_by_name || ticket.resolved_by_id || 'N/A'} />
              <Field
                label="Resolved At"
                value={
                  ticket.resolved_at
                    ? new Date(ticket.resolved_at).toLocaleString()
                    : '-'
                }
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Field label="Resolution Notes" value={ticket.resolution_notes} />
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

export function openITTicketCreate(refetch: () => void) {
  modals.open({
    title: 'Create New IT Ticket',
    children: (
      <CreateITTicketForm
        onSubmit={() => {
          refetch();
          modals.closeAll();
        }}
      />
    ),
    size: '60rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openITTicketEdit(id: string, refetch: () => void) {
  modals.open({
    title: 'Edit IT Ticket',
    children: (
      <EditITTicketForm
        id={id}
        onSubmit={() => {
          refetch();
          modals.closeAll();
        }}
      />
    ),
    size: '60rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openITTicketView(id: string) {
  modals.open({
    title: 'View IT Ticket',
    children: <ViewITTicket id={id} />,
    size: '60rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openITTicketResolve(id: string, refetch: () => void) {
  modals.open({
    title: 'Resolve IT Ticket',
    children: (
      <ResolveITTicketForm
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

export function openITTicketAssign(id: string, refetch: () => void) {
  modals.open({
    title: 'Assign IT Ticket',
    children: (
      <AssignITTicketForm
        id={id}
        onSubmit={() => {
          refetch();
          modals.closeAll();
        }}
      />
    ),
    size: '40rem',
    zIndex: 2000,
    withCloseButton: false,
  });
}
