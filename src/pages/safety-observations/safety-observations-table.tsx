import { client } from '@/api/axios';
import { BackendResponse } from '@/api/entities';
import { ObservationStatusType, SafetyObservationType } from '@/api/entities/safety-observations';
import { usePagination } from '@/api/helpers';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import { useAuth } from '@/hooks';
import {
  useDeleteSafetyObservation,
  useGetSafetyObservationList,
} from '@/hooks/api/safety-observations';
import { icons } from '@/utilities/icons';
import { Badge, Button, Group, Select, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDebouncedCallback } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconDownload } from '@tabler/icons-react';
import { DataTableColumn } from 'mantine-datatable';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  openSafetyObservationClose,
  openSafetyObservationCreate,
  openSafetyObservationEdit,
  openSafetyObservationResolve,
  openSafetyObservationView,
} from './safety-observations-modals';

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

type SortableFields = Pick<SafetyObservationType, 'observation_date' | 'status'>;

// Export data fetching function
async function fetchExportData(): Promise<Array<Record<string, string>>> {
  const response = await client.get('/safety-observations/export/csv');
  return BackendResponse.parse(response.data).data as Array<Record<string, string>>;
}

// Export to CSV utility
function downloadCSV(data: Array<Record<string, string>>, filename: string) {
  if (data.length === 0) return;

  // Define Indonesian headers
  const headerMap: Record<string, string> = {
    observation_date: 'Tanggal',
    observation_time: 'Waktu',
    location_area: 'Lokasi/Area',
    department_unit: 'Departemen/Unit',
    facility: 'Fasilitas',
    observer: 'Observer',
    contact_info: 'Kontak',
    observation_types: 'Jenis Observasi',
    observation_categories: 'Kategori Observasi',
    category_other: 'Kategori Lainnya',
    observation_description: 'Deskripsi Observasi',
    potential_impacts: 'Dampak Potensial',
    impact_explanation: 'Penjelasan Dampak',
    suggested_corrective_action: 'Saran Perbaikan',
    immediate_action_done: 'Tindakan Langsung',
    immediate_action_description: 'Deskripsi Tindakan Langsung',
    has_supporting_evidence: 'Bukti Pendukung',
    status: 'Status',
    resolved_by: 'Diselesaikan Oleh',
    resolved_at: 'Tanggal Penyelesaian',
    resolution_notes: 'Catatan Penyelesaian',
    closed_by: 'Ditutup Oleh',
    closed_at: 'Tanggal Penutupan',
    close_reason: 'Alasan Penutupan',
  };

  const headers = Object.keys(data[0]);
  const headerRow = headers.map((h) => headerMap[h] || h).join(',');

  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h] ?? '';
        // Escape quotes and wrap in quotes if contains comma or newline
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      })
      .join(',')
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

// Stable Filter Components to prevent focus loss during Parent re-renders
const SafeTextInputFilter = ({
  name,
  label,
  filters,
  setPage,
}: {
  name: string;
  label: string;
  filters: any;
  setPage: (p: number) => void;
}) => {
  const [localValue, setLocalValue] = useState((filters.filters[name]?.value as string) ?? '');

  useEffect(() => {
    const externalValue = (filters.filters[name]?.value as string) ?? '';
    if (externalValue !== localValue) {
      setLocalValue(externalValue);
    }
  }, [filters.filters[name]?.value]);

  const debouncedChange = useDebouncedCallback((val: string) => {
    filters.change({ name, label, value: val });
    setPage(1);
  }, 500);

  return (
    <TextInput
      label={label}
      placeholder={`Filter by ${label.toLowerCase()}...`}
      value={localValue}
      onChange={(e) => {
        const val = e.currentTarget.value;
        setLocalValue(val);
        debouncedChange(val);
      }}
      p="xs"
    />
  );
};

const SingleDateFilter = ({ filters, setPage }: { filters: any; setPage: (p: number) => void }) => {
  const dateValue = filters.filters.date?.value
    ? new Date(filters.filters.date.value as string)
    : null;

  return (
    <DateInput
      p="xs"
      label="Date"
      placeholder="Specific date"
      value={dateValue}
      onChange={(date) => {
        if (date) {
          filters.change({
            name: 'date',
            label: 'Date',
            value: date,
          });
        } else {
          filters.remove('date');
        }
        setPage(1);
      }}
      valueFormat="YYYY-MM-DD"
      clearable
    />
  );
};

export function SafetyObservationsTable() {
  const { user } = useAuth();
  const { page, limit, setLimit, setPage } = usePagination();

  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'desc',
      column: 'observation_date',
    },
  });

  const [isExporting, setIsExporting] = useState(false);

  // Format dates for API
  const formatDate = (val: any) => {
    if (!val) return undefined;
    const d = new Date(val);
    return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : undefined;
  };

  const { data, isLoading, refetch } = useGetSafetyObservationList({
    query: {
      page,
      limit,
      sort: sort.query,
      status: filters.filters.status?.value as string | undefined,
      start_date: formatDate(filters.filters.start_date?.value),
      end_date: formatDate(filters.filters.end_date?.value),
      date: formatDate(filters.filters.date?.value),
      observer_name: filters.filters.observer_name?.value as string | undefined,
    },
  });

  const { mutate: deleteObservation } = useDeleteSafetyObservation();

  const handleDelete = useCallback(
    (id: string) => {
      modals.openConfirmModal({
        title: 'Delete Safety Observation',
        children: 'Are you sure you want to delete this observation?',
        confirmProps: { color: 'red' },
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        onConfirm: () => {
          deleteObservation({ route: { id } });
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
      const filename = `safety_observations_${dateStr}.csv`;

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

  const columns: DataTableColumn<SafetyObservationType>[] = useMemo(
    () => [
      {
        accessor: 'observation_date',
        title: 'Date',
        sortable: true,
        render: ({ observation_date, observation_time }) => {
          const date = new Date(observation_date);
          return `${date.toLocaleDateString()} ${observation_time || ''}`;
        },
        filter: <SingleDateFilter filters={filters} setPage={setPage} />,
        filtering: Boolean(filters.filters.date),
      },
      {
        accessor: 'observer_name',
        title: 'Observer',
        sortable: true,
        filtering: Boolean(filters.filters.observer_name),
        filter: (
          <SafeTextInputFilter name="observer_name" label="Observer" filters={filters} setPage={setPage} />
        ),
      },
      {
        accessor: 'location_area',
        title: 'Location',
        ellipsis: true,
        render: ({ location_area, facility_name }) => location_area || facility_name || '-',
      },
      {
        accessor: 'observation_description',
        title: 'Description',
        ellipsis: true,
        width: 250,
      },
      {
        accessor: 'observation_categories',
        title: 'Categories',
        render: ({ observation_categories }) =>
          observation_categories && observation_categories.length > 0 ? (
            <Group gap={4}>
              {observation_categories.slice(0, 2).map((cat, idx) => (
                <Badge key={idx} size="sm" color="blue">
                  {cat}
                </Badge>
              ))}
              {observation_categories.length > 2 && (
                <Badge size="sm" variant="outline">
                  +{observation_categories.length - 2}
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
          <Badge color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
        ),
        filtering: Boolean(filters.filters.status),
        filter: (
          <Select
            label="Status"
            description="Filter by status"
            placeholder="Select status"
            value={(filters.filters.status?.value as string) ?? null}
            onChange={(value) => {
              if (value) {
                filters.change({
                  name: 'status',
                  label: 'Status',
                  value,
                });
              } else {
                filters.remove('status');
              }
              setPage(1);
            }}
            data={[
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ]}
            clearable
          />
        ),
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        width: 180,
        render: (row: SafetyObservationType) => (
          <DataTable.Actions
            onView={() => openSafetyObservationView(row.id!)}
            onResolve={
              (isHSE || isManager) && row.status !== 'resolved' && row.status !== 'closed'
                ? () => openSafetyObservationResolve(row.id!, refetch)
                : null
            }
            onClose={
              (isHSE || isManager) && row.status !== 'resolved' && row.status !== 'closed'
                ? () => openSafetyObservationClose(row.id!, refetch)
                : null
            }
            onEdit={
              isManager || row.observer_id === user?.id
                ? () => openSafetyObservationEdit(row.id!, refetch)
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
        title="Safety Observation Cards"
        actions={
          <Group gap="xs">
            <DateInput
              placeholder="From Date"
              size="xs"
              w={140}
              clearable
              value={filters.filters.start_date?.value ? new Date(filters.filters.start_date.value as any) : null}
              onChange={(date) => {
                if (date) {
                  filters.change({ name: 'start_date', label: 'From', value: date });
                } else {
                  filters.remove('start_date');
                }
                setPage(1);
              }}
              valueFormat="YYYY-MM-DD"
            />
            <DateInput
              placeholder="To Date"
              size="xs"
              w={140}
              clearable
              value={filters.filters.end_date?.value ? new Date(filters.filters.end_date.value as any) : null}
              onChange={(date) => {
                if (date) {
                  filters.change({ name: 'end_date', label: 'To', value: date });
                } else {
                  filters.remove('end_date');
                }
                setPage(1);
              }}
              valueFormat="YYYY-MM-DD"
            />
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
              onClick={() => openSafetyObservationCreate(refetch)}
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
          noRecordsText={DataTable.noRecordsText('safety observations')}
          recordsPerPageLabel={DataTable.recordsPerPageLabel('safety observations')}
          paginationText={DataTable.paginationText('safety observations')}
          page={page}
          records={data?.data ?? []}
          fetching={isLoading}
          onPageChange={setPage}
          recordsPerPage={limit}
          totalRecords={data?.meta?.total ?? 0}
          onRecordsPerPageChange={setLimit}
          recordsPerPageOptions={[0, 15, 30, 100, 200]}
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
