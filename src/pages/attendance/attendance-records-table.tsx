import { AttendanceRecord } from '@/api/entities/attendance';
import { usePagination } from '@/api/helpers';
import { DataTable } from '@/components/data-table';
import { useGetAttendanceRecords } from '@/hooks/api/attendance';
import { icons } from '@/utilities/icons';
import { Badge } from '@mantine/core';
import { DataTableColumn } from 'mantine-datatable';
import { useMemo } from 'react';
import z from 'zod';

type AttendanceRecordType = z.infer<typeof AttendanceRecord>;

type SortableFields = Pick<AttendanceRecordType, 'check_in_time' | 'check_out_time'>;

export function AttendanceRecordsTable() {
  const { page, limit, setLimit, setPage } = usePagination();

  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'desc',
      column: 'check_in_time',
    },
  });

  const { data, isLoading, refetch } = useGetAttendanceRecords({
    query: {
      page,
      limit,
      sort: sort.query,
    },
  });

  const calculateDuration = (checkIn: Date, checkOut: Date | null) => {
    if (!checkOut) return 'In progress';
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const durationMs = end.getTime() - start.getTime();
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const columns: DataTableColumn<AttendanceRecordType>[] = useMemo(
    () => [
      {
        accessor: 'employee_name',
        title: 'Employee',
        render: ({ employee_name }) => employee_name ?? '-',
      },
      {
        accessor: 'location_name',
        title: 'Location',
        render: ({ location_name }) => location_name ?? '-',
      },
      {
        accessor: 'check_in_time',
        title: 'Check In',
        sortable: true,
        render: ({ check_in_time }) => new Date(check_in_time).toLocaleString(),
      },
      {
        accessor: 'check_out_time',
        title: 'Check Out',
        sortable: true,
        render: ({ check_out_time }) =>
          check_out_time ? new Date(check_out_time).toLocaleString() : '-',
      },
      {
        accessor: 'duration',
        title: 'Duration',
        render: ({ check_in_time, check_out_time }) =>
          calculateDuration(check_in_time, check_out_time ?? null),
      },
      {
        accessor: 'status',
        title: 'Status',
        textAlign: 'center',
        render: ({ status }) => (
          <Badge color={status === 'checked_in' ? 'green' : 'gray'} variant="light">
            {status === 'checked_in' ? 'Checked In' : 'Checked Out'}
          </Badge>
        ),
      },
    ],
    []
  );

  const Icon = icons.clock;

  return (
    <DataTable.Container>
      <DataTable.Title icon={<Icon size={25} />} title="Attendance Records" />
      <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
      <DataTable.Content>
        <DataTable.Table
          striped
          minHeight={240}
          noRecordsText={DataTable.noRecordsText('attendance records')}
          recordsPerPageLabel={DataTable.recordsPerPageLabel('attendance records')}
          paginationText={DataTable.paginationText('attendance records')}
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
  );
}
