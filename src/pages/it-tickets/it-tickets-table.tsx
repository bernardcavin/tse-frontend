import { client } from '@/api/axios';
import { BackendResponse } from '@/api/entities';
import {
    ITTicketType,
    TicketCategoryType,
    TicketPriorityType,
    TicketStatusType,
} from '@/api/entities/it-tickets';
import { usePagination } from '@/api/helpers';
import {
    useDeleteITTicket,
    useITTickets,
} from '@/api/resources/it-tickets';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import { useAuth } from '@/hooks';
import { Badge, Button, Group } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconDownload, IconTicket } from '@tabler/icons-react';
import { DataTableColumn } from 'mantine-datatable';
import { useCallback, useMemo, useState } from 'react';
import {
    openITTicketAssign,
    openITTicketCreate,
    openITTicketEdit,
    openITTicketResolve,
    openITTicketView,
} from './it-tickets-modals';

const STATUS_COLORS: Record<TicketStatusType, string> = {
  open: 'red',
  in_progress: 'yellow',
  resolved: 'green',
  closed: 'gray',
};

const STATUS_LABELS: Record<TicketStatusType, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const CATEGORY_LABELS: Record<TicketCategoryType, string> = {
  hardware: 'Hardware',
  software: 'Software',
  network: 'Network',
  account_access: 'Account/Access',
  other: 'Other',
};

const PRIORITY_COLORS: Record<TicketPriorityType, string> = {
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  critical: 'red',
};

const PRIORITY_LABELS: Record<TicketPriorityType, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

type SortableFields = Pick<
  ITTicketType,
  'created_at' | 'status' | 'priority'
>;

// Export data fetching function
async function fetchExportData(): Promise<Array<Record<string, string>>> {
  const response = await client.get('/it-tickets/export/csv');
  return BackendResponse.parse(response.data).data as Array<Record<string, string>>;
}

// Export to CSV utility
function downloadCSV(data: Array<Record<string, string>>, filename: string) {
  if (data.length === 0) return;
  
  // Define Indonesian headers
  const headerMap: Record<string, string> = {
    title: 'Judul',
    description: 'Deskripsi',
    category: 'Kategori',
    priority: 'Prioritas',
    status: 'Status',
    reporter: 'Pelapor',
    facility: 'Fasilitas',
    inventory_item: 'Item Inventaris',
    assigned_to: 'Ditugaskan Ke',
    resolved_by: 'Diselesaikan Oleh',
    resolved_at: 'Tanggal Penyelesaian',
    resolution_notes: 'Catatan Penyelesaian',
    created_at: 'Tanggal Dibuat',
  };
  
  const headers = Object.keys(data[0]);
  const headerRow = headers.map(h => headerMap[h] || h).join(',');
  
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h] ?? '';
      // Escape quotes and wrap in quotes if contains comma or newline
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );
  
  const csvContent = [headerRow, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ITTicketsTable() {
  const { user } = useAuth();
  const { page, limit, setLimit, setPage } = usePagination();

  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'desc',
      column: 'created_at',
    },
  });

  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, refetch } = useITTickets();

  const { mutate: deleteTicket } = useDeleteITTicket();
  
  const handleDelete = useCallback(
    (id: string) => {
      modals.openConfirmModal({
        title: 'Delete IT Ticket',
        children: 'Are you sure you want to delete this IT ticket?',
        confirmProps: { color: 'red' },
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        onConfirm: () => {
          deleteTicket(id);
          refetch();
        },
      });
    },
    [deleteTicket, refetch]
  );

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const exportData = await fetchExportData();
      
      if (!exportData || exportData.length === 0) {
        notifications.show({ message: 'No data to export', color: 'yellow' });
        return;
      }
      
      // Generate filename with date
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `it_tickets_${dateStr}.csv`;
      
      downloadCSV(exportData, filename);
      
      notifications.show({
        title: 'Export Berhasil',
        message: 'File berhasil diunduh',
        color: 'green',
      });
    } catch (error) {
      console.error('Export failed:', error);
      notifications.show({ message: 'Export failed: ' + error, color: 'red' });
    } finally {
      setIsExporting(false);
    }
  }, []);

  const isIT = user?.department === 'IT';
  const isManager = user?.role === 'MANAGER';

  const columns: DataTableColumn<ITTicketType>[] = useMemo(
    () => [
      {
        accessor: 'title',
        title: 'Title',
        ellipsis: true,
        width: 200,
      },
      {
        accessor: 'category',
        title: 'Category',
        render: ({ category }) => (
          <Badge variant="light">
            {CATEGORY_LABELS[category]}
          </Badge>
        ),
      },
      {
        accessor: 'priority',
        title: 'Priority',
        sortable: true,
        render: ({ priority }) => (
          <Badge color={PRIORITY_COLORS[priority]}>
            {PRIORITY_LABELS[priority]}
          </Badge>
        ),
      },
      {
        accessor: 'status',
        title: 'Status',
        sortable: true,
        textAlign: 'center',
        render: ({ status }) => (
          <Badge color={STATUS_COLORS[status]}>
            {STATUS_LABELS[status]}
          </Badge>
        ),
      },
      {
        accessor: 'assigned_to_id',
        title: 'Assigned To',
        ellipsis: true,
        render: ({ assigned_to_name }) => assigned_to_name || '-',
      },
      {
        accessor: 'created_at',
        title: 'Created',
        sortable: true,
        render: ({ created_at }) => {
          if (!created_at) return '-';
          return new Date(created_at).toLocaleDateString();
        },
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        width: 200,
        render: (row: ITTicketType) => (
          <Group gap="xs" justify="flex-end">
            <DataTable.Actions
              onView={() => openITTicketView(row.id!)}
              onResolve={
                (isIT || isManager) && row.status !== 'resolved' && row.status !== 'closed'
                  ? () => openITTicketResolve(row.id!, refetch)
                  : null
              }
              onEdit={
                isManager || row.reporter_id === user?.id
                  ? () => openITTicketEdit(row.id!, refetch)
                  : null
              }
              onDelete={
                isManager || (row.reporter_id === user?.id && row.status === 'open')
                  ? () => handleDelete(row.id!)
                  : null
              }
            />
            {(isIT || isManager) && row.status !== 'resolved' && row.status !== 'closed' && (
              <Button
                size="xs"
                variant="subtle"
                onClick={() => openITTicketAssign(row.id!, refetch)}
              >
                Assign
              </Button>
            )}
          </Group>
        ),
      },
    ],
    [handleDelete, isIT, isManager, user?.id, refetch]
  );

  return (
    <DataTable.Container>
      <DataTable.Title
        icon={<IconTicket size={25} />}
        title="IT Tickets"
        actions={
          <Group gap="xs">
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconDownload size={16} />}
              onClick={handleExport}
              loading={isExporting}
            >
              Export
            </Button>
            <AddButton
              variant="default"
              size="xs"
              onClick={() => openITTicketCreate(refetch)}
            >
              Add Ticket
            </AddButton>
          </Group>
        }
      />
      <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
      <DataTable.Content>
        <DataTable.Table
          striped
          minHeight={240}
          noRecordsText={DataTable.noRecordsText('IT tickets')}
          recordsPerPageLabel={DataTable.recordsPerPageLabel('IT tickets')}
          paginationText={DataTable.paginationText('IT tickets')}
          page={page}
          records={data?.data ?? []}
          fetching={isLoading}
          onPageChange={setPage}
          recordsPerPage={limit}
          totalRecords={data?.meta?.total ?? 0}
          onRecordsPerPageChange={setLimit}
          recordsPerPageOptions={[5, 15, 30]}
          sortStatus={sort.status}
          onSortStatusChange={sort.change}
          columns={columns}
          pinLastColumn
          highlightOnHover
        />
      </DataTable.Content>
    </DataTable.Container>
  );
}
