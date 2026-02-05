import { LeaveRequest } from '@/api/entities/attendance';
import { usePagination } from '@/api/helpers';
import { DataTable } from '@/components/data-table';
import { useGetLeaveRequests, useUpdateLeaveRequestStatus } from '@/hooks/api/attendance';
import { useAuth } from '@/hooks/use-auth';
import { icons } from '@/utilities/icons';
import { Badge, Button, Group, Modal, Text, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DataTableColumn } from 'mantine-datatable';
import { useMemo, useState } from 'react';
import z from 'zod';

type LeaveRequestTypeRaw = z.infer<typeof LeaveRequest>;

type SortableFields = Pick<LeaveRequestTypeRaw, 'created_at' | 'start_date'>;

import { LeaveRequestModal } from './leave-request-modal';

export function LeaveRequestsTable() {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';
  
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  
  const { page, limit, setLimit, setPage } = usePagination();
  
  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'desc',
      column: 'created_at',
    },
  });

  const { data, isLoading } = useGetLeaveRequests({
    query: {
      page,
      limit,
      sort: sort.query,
    },
  });
  
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateLeaveRequestStatus();
  
  const [rejectModalOpened, { open: openRejectModal, close: closeRejectModal }] = useDisclosure(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestTypeRaw | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = (request: LeaveRequestTypeRaw) => {
    if (!confirm('Are you sure you want to approve this request?')) return;
    
    updateStatus({
        route: { id: request.id! },
        variables: { status: 'approved' }
    });
  };

  const handleRejectClick = (request: LeaveRequestTypeRaw) => {
    setSelectedRequest(request);
    setRejectionReason('');
    openRejectModal();
  };

  const handleRejectConfirm = () => {
    if (!selectedRequest?.id) return;
    
    updateStatus(
        {
            route: { id: selectedRequest.id },
            variables: { status: 'rejected', rejection_reason: rejectionReason }
        },
        {
            onSuccess: () => {
                closeRejectModal();
            }
        }
    );
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'approved': return 'green';
        case 'rejected': return 'red';
        case 'pending': return 'yellow';
        default: return 'gray';
    }
  };

  const columns: DataTableColumn<LeaveRequestTypeRaw>[] = useMemo(
    () => [
      {
        accessor: 'employee_name',
        title: 'Employee',
        hidden: !isManager, // Potentially hide if employee only sees own, but actually employee knows their name.
        // If employee view, maybe redundancy but harmless.
        render: ({ employee_name }) => employee_name ?? 'Unknown',
      },
      {
        accessor: 'leave_type',
        title: 'Type',
        render: ({ leave_type }) => <Badge variant="outline">{leave_type}</Badge>,
      },
      {
        accessor: 'start_date',
        title: 'Duration',
        render: ({ start_date, end_date }) => (
            <Text size="sm">
                {formatDate(start_date)} - {formatDate(end_date)}
            </Text>
        ),
      },
      {
        accessor: 'reason',
        title: 'Reason',
        width: 300,
        render: ({ reason }) => (
            <Text size="sm" lineClamp={2} title={reason}>
                {reason}
            </Text>
        ),
      },
      {
        accessor: 'status',
        title: 'Status',
        render: ({ status }) => (
            <Badge color={getStatusColor(status)}>{status.toUpperCase()}</Badge>
        ),
      },
      {
        accessor: 'actions',
        title: 'Actions',
        hidden: !isManager,
        render: (record) => (
            record.status === 'pending' ? (
                <Group gap="xs">
                    <Button 
                        size="xs" 
                        color="green" 
                        variant="light" 
                        onClick={() => handleApprove(record)}
                        loading={isUpdating && selectedRequest?.id === record.id} // Simplistic loading state
                    >
                        Approve
                    </Button>
                    <Button 
                        size="xs" 
                        color="red" 
                        variant="light" 
                        onClick={() => handleRejectClick(record)}
                    >
                        Reject
                    </Button>
                </Group>
            ) : null
        ),
      },
    ],
    [isManager, isUpdating]
  );
  
  const Icon = icons.clipboardCheck;

  return (
    <>
      <DataTable.Container>
        <Group justify="space-between" mb="md">
            <DataTable.Title icon={<Icon size={25} />} title="Leave Requests" />
            {!isManager && (
                <Button onClick={openCreateModal}>New Request</Button>
            )}
        </Group>
        <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
        <DataTable.Content>
          <DataTable.Table
             striped
             minHeight={240}
             noRecordsText={DataTable.noRecordsText('leave requests')}
             recordsPerPageLabel={DataTable.recordsPerPageLabel('leave requests')}
             paginationText={DataTable.paginationText('leave requests')}
             page={page}
             records={data?.data ?? []}
             fetching={isLoading}
             onPageChange={setPage}
             recordsPerPage={limit}
             totalRecords={data?.meta.total ?? 0}
             onRecordsPerPageChange={setLimit}
             recordsPerPageOptions={[5, 15, 30]}
             sortStatus={sort.status}
             onSortStatusChange={sort.change}
             columns={columns}
             highlightOnHover
          />
        </DataTable.Content>
      </DataTable.Container>

      <LeaveRequestModal opened={createModalOpened} onClose={closeCreateModal} />

      <Modal opened={rejectModalOpened} onClose={closeRejectModal} title="Reject Leave Request">
        <Textarea
            label="Rejection Reason"
            placeholder="Why is this request being rejected?"
            minRows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.currentTarget.value)}
            data-autofocus
        />
        <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeRejectModal}>Cancel</Button>
            <Button color="red" onClick={handleRejectConfirm} loading={isUpdating}>Reject</Button>
        </Group>
      </Modal>
    </>
  );
}
