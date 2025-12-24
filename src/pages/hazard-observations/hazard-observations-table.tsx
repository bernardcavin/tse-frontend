import { client } from '@/api/axios';
import { BackendResponse } from '@/api/entities';
import {
  HazardObservationType,
  ObservationStatusType,
} from '@/api/entities/hazard-observations';
import { usePagination } from '@/api/helpers';
import {
  useDeleteHazardObservation,
  useHazardObservations,
} from '@/api/resources/hazard-observations';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import { useAuth } from '@/hooks';
import { icons } from '@/utilities/icons';
import { Badge, Button, Group } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconDownload } from '@tabler/icons-react';
import { DataTableColumn } from 'mantine-datatable';
import { useCallback, useMemo, useState } from 'react';
import {
  openHazardObservationCreate,
  openHazardObservationEdit,
  openHazardObservationResolve,
  openHazardObservationView,
} from './hazard-observations-modals';

const STATUS_COLORS: Record<ObservationStatusType, string> = {
  open: 'red',
  in_progress: 'yellow',
  resolved: 'green',
  closed: 'gray',
};

const STATUS_LABELS: Record<ObservationStatusType, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

type SortableFields = Pick<
  HazardObservationType,
  'observation_date' | 'status'
>;

// Export data fetching function
async function fetchExportData(): Promise<Array<Record<string, string>>> {
  const response = await client.get('/hazard-observations/export/csv');
  return BackendResponse.parse(response.data).data as Array<Record<string, string>>;
}

// Export to CSV utility
function downloadCSV(data: Array<Record<string, string>>, filename: string) {
  if (data.length === 0) return;
  
  // Define Indonesian headers
  const headerMap: Record<string, string> = {
    observation_date: 'Tanggal',
    observation_time: 'Waktu',
    facility: 'Fasilitas',
    observer: 'Observer',
    unsafe_action_condition: 'Kondisi Tidak Aman',
    hazard_types: 'Tipe Bahaya',
    potential_risks: 'Potensi Risiko',
    potential_risk_other: 'Potensi Risiko Lainnya',
    unsafe_reasons: 'Alasan Tidak Aman',
    unsafe_reason_other: 'Alasan Lainnya',
    control_measures: 'Tindakan Pengendalian',
    control_measure_other: 'Tindakan Lainnya',
    corrective_action: 'Tindakan Korektif',
    status: 'Status',
    resolved_by: 'Diselesaikan Oleh',
    resolved_at: 'Tanggal Penyelesaian',
    resolution_notes: 'Catatan Penyelesaian',
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

export function HazardObservationsTable() {
  const { user } = useAuth();
  const { page, limit, setLimit, setPage } = usePagination();

  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'desc',
      column: 'observation_date',
    },
  });

  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, refetch } = useHazardObservations();

  const { mutate: deleteObservation } = useDeleteHazardObservation();
  
  const handleDelete = useCallback(
    (id: string) => {
      modals.openConfirmModal({
        title: 'Delete Hazard Observation',
        children: 'Are you sure you want to delete this hazard observation?',
        confirmProps: { color: 'red' },
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        onConfirm: () => {
          deleteObservation(id);
          refetch();
        },
      });
    },
    [deleteObservation, refetch]
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
      const filename = `hazard_observations_${dateStr}.csv`;
      
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

  const isHSE = user?.department === 'HSE';
  const isManager = user?.role === 'MANAGER';

  const columns: DataTableColumn<HazardObservationType>[] = useMemo(
    () => [
      {
        accessor: 'observation_date',
        title: 'Date',
        sortable: true,
        render: ({ observation_date, observation_time }) => {
          const date = new Date(observation_date);
          return `${date.toLocaleDateString()} ${observation_time || ''}`;
        },
      },
      {
        accessor: 'facility_id',
        title: 'Facility',
        ellipsis: true,
        render: ({ facility_name, facility_id }) => facility_name || facility_id,
      },
      {
        accessor: 'unsafe_action_condition',
        title: 'Unsafe Condition',
        ellipsis: true,
        width: 250,
      },
      {
        accessor: 'hazard_types',
        title: 'Hazard Types',
        render: ({ hazard_types }) =>
          hazard_types && hazard_types.length > 0 ? (
            <Group gap={4}>
              {hazard_types.slice(0, 2).map((type, idx) => (
                <Badge key={idx} size="sm" >
                  {type}
                </Badge>
              ))}
              {hazard_types.length > 2 && (
                <Badge size="sm" variant="outline">
                  +{hazard_types.length - 2}
                </Badge>
              )}
            </Group>
          ) : (
            '-'
          ),
      },
      {
        accessor: 'status',
        title: 'Status',
        sortable: true,
        textAlign: 'center',
        render: ({ status }) => (
          <Badge color={STATUS_COLORS[status]} >
            {STATUS_LABELS[status]}
          </Badge>
        ),
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        width: 180,
        render: (row: HazardObservationType) => (
          <DataTable.Actions
            onView={() => openHazardObservationView(row.id!)}
            onResolve={
              isHSE && row.status !== 'resolved' && row.status !== 'closed'
                ? () => openHazardObservationResolve(row.id!, refetch)
                : null
            }
            onEdit={
              isManager || row.observer_id === user?.id
                ? () => openHazardObservationEdit(row.id!, refetch)
                : null
            }
            onDelete={isManager ? () => handleDelete(row.id!) : null}
          />
        ),
      },
    ],
    [handleDelete, isHSE, isManager, user?.id, refetch]
  );

  const Icon = icons.alert;

  return (
    <DataTable.Container>
      <DataTable.Title
        icon={<Icon size={25} />}
        title="Hazard Observation Cards"
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
              onClick={() => openHazardObservationCreate(refetch)}
            >
              Add Observation
            </AddButton>
          </Group>
        }
      />
      <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
      <DataTable.Content>
        <DataTable.Table
          striped
          minHeight={240}
          noRecordsText={DataTable.noRecordsText('hazard observations')}
          recordsPerPageLabel={DataTable.recordsPerPageLabel('hazard observations')}
          paginationText={DataTable.paginationText('hazard observations')}
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
