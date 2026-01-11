import { Request, RequestStatus } from '@/api/entities/requests';
import { usePagination } from '@/api/helpers';
import { DataTable } from '@/components/data-table';
import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks';
import { useRequests } from '@/hooks/api/requests';
import {
  openRequestApprove,
  openRequestCancel,
  openRequestCreate,
  openRequestDone,
  openRequestReject,
  openRequestReport,
  openRequestTransfer,
  openRequestView
} from '@/pages/requests/request-modals';
import { paths } from '@/routes/paths';
import { ActionIcon, Badge, Button, Group, Menu, Text } from '@mantine/core';
import {
  IconCheck,
  IconCircleCheck,
  IconDots,
  IconEye,
  IconFileText,
  IconPlus,
  IconReceipt,
  IconSend,
  IconX
} from '@tabler/icons-react';
import { DataTableColumn } from 'mantine-datatable';
import { useMemo } from 'react';

const statusColors: Record<string, string> = {
  [RequestStatus.PENDING]: 'yellow',
  [RequestStatus.APPROVED]: 'blue',
  [RequestStatus.REJECTED]: 'red',
  [RequestStatus.TRANSFERRED]: 'cyan',
  [RequestStatus.REPORTED]: 'orange',
  [RequestStatus.DONE]: 'green',
  [RequestStatus.CANCELLED]: 'gray',
};

const breadcrumbs = [{ label: 'Requests', href: paths.manager.requests }, { label: 'List' }];

export const RequestsView = () => {
  const { user } = useAuth();
  const { page, limit, setLimit, setPage } = usePagination();
  
  const { filters, sort } = DataTable.useDataTable({
    sortConfig: { column: 'created_at', direction: 'desc' },
  });

  const { data: requestsData, isLoading, refetch } = useRequests({
    query: {
      page,
      limit,
      search: filters.query.search,
      sort: sort.query,
    },
  });

  const isManager = ['MANAGER', 'ADMIN', 'DIRECTOR'].includes(user?.role || '');
  const isFinance = user?.department === 'Finance' || ['ADMIN', 'DIRECTOR'].includes(user?.role || '');

  const columns: DataTableColumn<Request>[] = useMemo(
    () => [
      {
        accessor: 'created_at',
        title: 'Date',
        sortable: true,
        render: (request: Request) => new Date(request.created_at).toLocaleDateString(),
      },
      {
        accessor: 'type',
        title: 'Type',
        sortable: true,
        render: (request: Request) => (
          <Badge variant="light" color={request.type === 'purchase' ? 'blue' : 'violet'}>
            {request.type.toUpperCase()}
          </Badge>
        ),
      },
      {
        accessor: 'purpose',
        title: 'Purpose',
        sortable: true,
        render: (request: Request) => (
           <Text size="sm" lineClamp={1} title={request.purpose}>
            {request.purpose}
          </Text>
        ),
      },
      {
        accessor: 'estimated_cost',
        title: 'Est. Cost',
        sortable: true,
        render: (request: Request) =>
          new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
            request.estimated_cost
          ),
      },
      {
        accessor: 'status',
        title: 'Status',
        sortable: true,
        render: (request: Request) => (
          <Badge color={statusColors[request.status]}>{request.status.toUpperCase()}</Badge>
        ),
      },
      {
        accessor: 'actions',
        title: '',
        textAlign: 'right',
        render: (request: Request) => {
          const isRequester = user?.id === request.employee_id;

          return (
            <Menu position="bottom-end" withArrow>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item leftSection={<IconEye size={16} />} onClick={() => openRequestView(request)}>
                  View Details
                </Menu.Item>

                {/* Manager/Finance Actions */}
                {request.status === RequestStatus.PENDING && (isManager || isFinance) && (
                  <>
                    <Menu.Item
                      leftSection={<IconCheck size={16} />}
                      color="green"
                      onClick={() => openRequestApprove(request.id, refetch)}
                    >
                      Approve
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconX size={16} />}
                      color="red"
                      onClick={() => openRequestReject(request.id, refetch)}
                    >
                      Reject
                    </Menu.Item>
                  </>
                )}

                {request.status === RequestStatus.APPROVED && isFinance && (
                  <Menu.Item
                    leftSection={<IconSend size={16} />}
                    color="cyan"
                    onClick={() => openRequestTransfer(request.id, refetch)}
                  >
                    Transfer Funds
                  </Menu.Item>
                )}

                {request.status === RequestStatus.REPORTED && (isManager || isFinance) && (
                  <Menu.Item
                    leftSection={<IconCircleCheck size={16} />}
                    color="green"
                    onClick={() => openRequestDone(request.id, refetch)}
                  >
                    Mark as Done
                  </Menu.Item>
                )}

                {/* Employee (Requester) Actions */}
                {request.status === RequestStatus.TRANSFERRED && isRequester && (
                  <Menu.Item
                    leftSection={<IconReceipt size={16} />}
                    color="orange"
                    onClick={() => openRequestReport(request, refetch)}
                  >
                    Report Expenses
                  </Menu.Item>
                )}

                {/* Cancel Actions */}
                {request.status === RequestStatus.PENDING && isRequester && (
                  <Menu.Item
                    leftSection={<IconX size={16} />}
                    color="gray"
                    onClick={() => openRequestCancel(request.id, refetch)}
                  >
                    Cancel Request
                  </Menu.Item>
                )}

                {(isManager || isFinance) &&
                 request.status !== RequestStatus.DONE &&
                 request.status !== RequestStatus.CANCELLED && (
                  <Menu.Item
                    leftSection={<IconX size={16} />}
                    color="red"
                    onClick={() => openRequestCancel(request.id, refetch)}
                  >
                    Cancel Request
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          );
        },
      },
    ],
    [user, isManager, isFinance, refetch]
  );

  return (
    <Page title="Requests">
      <PageHeader title="Requests Management" breadcrumbs={breadcrumbs} />

      <DataTable.Container>
        <DataTable.Title
          icon={<IconFileText size={25} />}
          title="Requests"
          actions={
            <Button leftSection={<IconPlus size={16} />} onClick={() => openRequestCreate(refetch)} size="xs" variant="default">
              New Request
            </Button>
          }
        />

        <Group justify="space-between" mb="md" px="md" mt="md">
           <DataTable.TextInputFilter
            name="search"
            label="Search"
            placeholder="Search requests..."
            filters={filters}
            style={{ width: 300 }}
          />
        </Group>

        <DataTable.Filters
          filters={filters.filters}
          onClear={filters.clear}
        />

        <DataTable.Content>
          <DataTable.Table
            minHeight={200}
            fetching={isLoading}
            records={requestsData?.data ?? []}
            totalRecords={requestsData?.meta.total ?? 0}
            recordsPerPage={limit}
            page={page}
            onPageChange={setPage}
            onRecordsPerPageChange={setLimit}
            sortStatus={sort.status}
            onSortStatusChange={sort.change}
            columns={columns}
            recordsPerPageOptions={[5, 15, 30]}
            highlightOnHover
          />
        </DataTable.Content>
      </DataTable.Container>
    </Page>
  );
};
