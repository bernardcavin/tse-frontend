import { Request, RequestStatus } from '@/api/entities/requests';
import { FileDownloadButton } from '@/components/file-download';
import { NumberInput } from '@/components/forms';
import { FileUploadButton } from '@/components/forms/file-upload';
import { FileIdProvider, useFileIdManager } from '@/components/forms/file-upload-provider';
import { FormProvider } from '@/components/forms/form-provider';
import { Textarea } from '@/components/forms/text-area';
import { useRequestAction } from '@/hooks/api/requests';
import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Stack,
  Table,
  Text,
  Title
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import {
  IconCheck,
  IconCircleCheck,
  IconReceipt,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import { CreateRequestForm } from './request-form';

const statusColors: Record<string, string> = {
  [RequestStatus.PENDING]: 'yellow',
  [RequestStatus.APPROVED]: 'blue',
  [RequestStatus.REJECTED]: 'red',
  [RequestStatus.TRANSFERRED]: 'cyan',
  [RequestStatus.REPORTED]: 'orange',
  [RequestStatus.DONE]: 'green',
  [RequestStatus.CANCELLED]: 'gray',
};

export function openRequestCreate(refetch: () => void) {
  modals.open({
    title: 'Create New Request',
    children: (
      <CreateRequestForm
        onSubmit={() => {
          refetch();
          modals.closeAll();
        }}
      />
    ),
    size: 'lg',
    zIndex: 2000,
    withCloseButton: false,
  });
}

interface ViewRequestProps {
  request: Request;
}

function ViewRequest({ request }: ViewRequestProps) {
  const renderFileSection = (title: string, fileIds?: string[]) => {
    if (!fileIds || fileIds.length === 0) return null;

    return (
      <Box>
        <Text fw={500} mb="xs">{title}:</Text>
        <Table>
          <Table.Tbody>
            {fileIds.map((file_id) => (
              <Table.Tr key={file_id}>
                <Table.Td>
                  <FileDownloadButton file_id={file_id} withFileInfo />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    );
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={4}>{request.purpose}</Title>
        <Badge size="lg" color={statusColors[request.status]}>
          {request.status.toUpperCase()}
        </Badge>
      </Group>

      <Divider />

      <Stack gap="xs">
        <Group>
          <Text fw={500} w={120}>Type:</Text>
          <Text>{request.type.toUpperCase()}</Text>
        </Group>

        <Group>
          <Text fw={500} w={120}>Estimated Cost:</Text>
          <Text>
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
              request.estimated_cost
            )}
          </Text>
        </Group>

        {request.items && request.items.length > 0 && (
          <Box>
            <Text fw={500} mb="xs">Items:</Text>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Item Name</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Cost</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {request.items.map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{item.name}</Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.cost)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        )}

        {request.actual_cost && (
          <Group>
            <Text fw={500} w={120}>Actual Cost:</Text>
            <Text>
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
                request.actual_cost
              )}
            </Text>
          </Group>
        )}

        <Group>
          <Text fw={500} w={120}>Requester:</Text>
          <Text>{request.employee_name || 'Unknown'}</Text>
        </Group>

        <Group>
          <Text fw={500} w={120}>Date:</Text>
          <Text>{new Date(request.created_at).toLocaleDateString()}</Text>
        </Group>

        {request.rejection_reason && (
          <Group>
            <Text fw={500} w={120}>Rejection Reason:</Text>
            <Text c="red">{request.rejection_reason}</Text>
          </Group>
        )}
      </Stack>

      <Divider />

      {/* File Attachments Section */}
      <Stack gap="md">
        {renderFileSection('Attachments', request.attachment_file_ids || undefined)}
        {renderFileSection('Transfer Proofs', request.transfer_proof_file_ids || undefined)}
        {renderFileSection('Receipts', request.receipt_file_ids || undefined)}
      </Stack>
    </Stack>
  );
}

export function openRequestView(request: Request) {
  modals.open({
    title: 'View Request',
    children: <ViewRequest request={request} />,
    size: 'lg',
    zIndex: 2000,
  });
}

export function openRequestApprove(id: string, refetch: () => void) {
  function ApproveContent() {
    const { mutate, isPending } = useRequestAction();

    return (
      <Stack>
        <Text>Are you sure you want to approve this request?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => modals.closeAll()}>Cancel</Button>
          <Button
            color="green"
            leftSection={<IconCheck size={16} />}
            loading={isPending}
            onClick={() => {
              mutate(
                { route: { id }, variables: { action: 'approve' } },
                {
                  onSuccess: () => {
                    refetch();
                    modals.closeAll();
                  },
                }
              );
            }}
          >
            Approve
          </Button>
        </Group>
      </Stack>
    );
  }

  modals.open({
    title: 'Approve Request',
    children: <ApproveContent />,
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openRequestReject(id: string, refetch: () => void) {
  function RejectContent() {
    const { mutate, isPending } = useRequestAction();
    const form = useForm({
      initialValues: { rejection_reason: '' },
      validate: {
        rejection_reason: (value) => !value ? 'Rejection reason is required' : null,
      },
    });

    return (
      <FormProvider form={form}>
        <form
          onSubmit={form.onSubmit((values) => {
            mutate(
              { route: { id }, variables: { action: 'reject', ...values } },
              {
                onSuccess: () => {
                  refetch();
                  modals.closeAll();
                },
              }
            );
          })}
        >
          <Stack>
            <Textarea
              label="Reason"
              placeholder="Why is this request being rejected?"
              required
              name="rejection_reason"
              minRows={3}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => modals.closeAll()}>
                Cancel
              </Button>
              <Button type="submit" color="red" leftSection={<IconX size={16} />} loading={isPending}>
                Reject
              </Button>
            </Group>
          </Stack>
        </form>
      </FormProvider>
    );
  }

  modals.open({
    title: 'Reject Request',
    children: <RejectContent />,
    size: 'md',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openRequestTransfer(id: string, refetch: () => void) {
  function TransferContent() {
    const { mutate, isPending } = useRequestAction();
    const fileIdManager = useFileIdManager();
    const form = useForm({
      initialValues: { transfer_proof_file_ids: [] },
    });
    const handleSubmit=form.onSubmit((values) => {
              mutate(
                { route: { id }, variables: { action: 'transfer', ...values } },
                {
                  onSuccess: () => {
                    refetch();
                    fileIdManager.updateFilesMetadata();
                    modals.closeAll();
                  },
                }
              );
            })

    return (
      <FormProvider form={form} onSubmit={handleSubmit}>
        <FileIdProvider fileIdManager={fileIdManager}>
          <Stack>
              <Text size="sm">Upload proof of transfer to mark funds as transferred.</Text>
              <FileUploadButton
                name="transfer_proof_file_ids"
                label="Transfer Proof"
                multiple
              />
              <Group justify="flex-end">
                <Button variant="default" onClick={() => modals.closeAll()}>
                  Cancel
                </Button>
                <Button type="submit" color="cyan" leftSection={<IconSend size={16} />} loading={isPending}>
                  Confirm Transfer
                </Button>
              </Group>
            </Stack>
        </FileIdProvider>
      </FormProvider>
    );
  }

  modals.open({
    title: 'Transfer Funds',
    children: <TransferContent />,
    size: 'md',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openRequestReport(request: Request, refetch: () => void) {
  function ReportContent() {
    const { mutate, isPending } = useRequestAction();
    const fileIdManager = useFileIdManager();
    
    // Initialize form with items from the request
    const initialItems = request.items?.map(item => ({
      name: item.name,
      estimated_cost: item.cost,
      actual_cost: 0,
    })) || [];

    const form = useForm({
      initialValues: { 
        items: initialItems,
        total_actual_cost: 0,
        receipt_file_ids: [] 
      },
      validate: {
        items: {
          actual_cost: (value) => value <= 0 ? 'Actual cost must be greater than 0' : null,
        },
      },
    });

    // Auto-calculate total when item costs change
    const total = form.values.items.reduce((acc, item) => acc + (item.actual_cost || 0), 0);

    const handleSubmit = form.onSubmit((values) => {
              mutate(
                { 
                  route: { id: request.id }, 
                  variables: { 
                    action: 'report', 
                    actual_cost: total,
                    receipt_file_ids: values.receipt_file_ids 
                  } 
                },
                {
                  onSuccess: () => {
                    refetch();
                    fileIdManager.updateFilesMetadata();
                    modals.closeAll();
                  },
                }
              );
            })

    return (
      <FormProvider form={form} onSubmit={handleSubmit}>
        <FileIdProvider fileIdManager={fileIdManager}>
            <Stack>
              <Text size="sm" fw={500}>Report actual costs for each item:</Text>
              
              {form.values.items.map((item, index) => (
                <Group key={index} align="flex-start" wrap="nowrap">
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>{item.name}</Text>
                    <Text size="xs" c="dimmed">
                      Estimated: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.estimated_cost)}
                    </Text>
                  </Stack>
                  <NumberInput
                    placeholder="Actual cost"
                    min={0}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="Rp "
                    required
                    name={`items.${index}.actual_cost`}
                    style={{ width: 200 }}
                  />
                </Group>
              ))}

              <Divider />

              <Group justify="space-between">
                <Text fw={700}>Total Actual Cost:</Text>
                <Text fw={700} size="lg">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(total)}
                </Text>
              </Group>

              <FileUploadButton
                name="receipt_file_ids"
                label="Receipts/Proofs"
                multiple
              />
              
              <Group justify="flex-end">
                <Button variant="default" onClick={() => modals.closeAll()}>
                  Cancel
                </Button>
                <Button type="submit" color="orange" leftSection={<IconReceipt size={16} />} loading={isPending}>
                  Submit Report
                </Button>
              </Group>
            </Stack>
        </FileIdProvider>
      </FormProvider>
    );
  }

  modals.open({
    title: 'Report Expenses',
    children: <ReportContent />,
    size: 'lg',
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openRequestDone(id: string, refetch: () => void) {
  function DoneContent() {
    const { mutate, isPending } = useRequestAction();

    return (
      <Stack>
        <Text>Mark this request as completed?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => modals.closeAll()}>Cancel</Button>
          <Button
            color="green"
            leftSection={<IconCircleCheck size={16} />}
            loading={isPending}
            onClick={() => {
              mutate(
                { route: { id }, variables: { action: 'done' } },
                {
                  onSuccess: () => {
                    refetch();
                    modals.closeAll();
                  },
                }
              );
            }}
          >
            Mark as Done
          </Button>
        </Group>
      </Stack>
    );
  }

  modals.open({
    title: 'Mark as Done',
    children: <DoneContent />,
    zIndex: 2000,
    withCloseButton: false,
  });
}

export function openRequestCancel(id: string, refetch: () => void) {
  function CancelContent() {
    const { mutate, isPending } = useRequestAction();

    return (
      <Stack>
        <Text c="red">Are you sure you want to cancel this request?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => modals.closeAll()}>Go Back</Button>
          <Button
            color="red"
            loading={isPending}
            onClick={() => {
              mutate(
                { route: { id }, variables: { action: 'cancel' } },
                {
                  onSuccess: () => {
                    refetch();
                    modals.closeAll();
                  },
                }
              );
            }}
          >
            Cancel Request
          </Button>
        </Group>
      </Stack>
    );
  }

  modals.open({
    title: 'Cancel Request',
    children: <CancelContent />,
    zIndex: 2000,
    withCloseButton: false,
  });
}
