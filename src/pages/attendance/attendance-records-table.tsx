import { AttendanceRecord } from '@/api/entities/attendance';
import { usePagination } from '@/api/helpers';
import { DataTable } from '@/components/data-table';
import { useGetAttendanceRecords, useUpdateAttendanceRecord } from '@/hooks/api/attendance';
import { icons } from '@/utilities/icons';
import { ActionIcon, Badge, Button, Group, Modal, Textarea, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DataTableColumn } from 'mantine-datatable';
import { useMemo, useState } from 'react';
import z from 'zod';

type AttendanceRecordType = z.infer<typeof AttendanceRecord>;

type SortableFields = Pick<AttendanceRecordType, 'check_in_time' | 'check_out_time'>;

interface AttendanceRecordsTableProps {
  userId?: string;
}

export function AttendanceRecordsTable({ userId }: AttendanceRecordsTableProps) {
  const { page, limit, setLimit, setPage } = usePagination();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecordType | null>(null);
  const [notes, setNotes] = useState('');

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
      user_id: userId,
    },
  });

  const updateMutation = useUpdateAttendanceRecord();

  const handleEditNotes = (record: AttendanceRecordType) => {
    setSelectedRecord(record);
    setNotes(record.notes ?? '');
    open();
  };

  const handleSaveNotes = () => {
    if (selectedRecord && selectedRecord.id) {
      updateMutation.mutate(
        { route: { id: selectedRecord.id }, variables: { notes: notes } },
        {
          onSuccess: () => {
            close();
            // Optionally refetch or let invalidateQueries handle it
          },
        }
      );
    }
  };

  const formatDateTime24Hour = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

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
        render: ({ check_in_time }) => formatDateTime24Hour(check_in_time),
      },
      {
        accessor: 'check_out_time',
        title: 'Check Out',
        sortable: true,
        render: ({ check_out_time }) =>
          check_out_time ? formatDateTime24Hour(check_out_time) : '-',
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
      {
        accessor: 'notes',
        title: 'Notes',
        render: (record) => (
            <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => handleEditNotes(record)}>
                {record.notes ? (
                    <Tooltip label={record.notes} multiline w={200}>
                        <div style={{
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            maxWidth: 150 
                        }}>
                            {record.notes}
                        </div>
                    </Tooltip>
                ) : (
                    <span style={{ color: 'var(--mantine-color-dimmed)', fontStyle: 'italic', fontSize: '0.9em' }}>
                        Add note...
                    </span>
                )}
                <ActionIcon variant="subtle" size="sm" color="blue">
                    <icons.pencil size={14} />
                </ActionIcon>
            </Group>
        ),
      },
    ],
    []
  );

  const Icon = icons.clock;

  return (
    <>
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

      <Modal opened={opened} onClose={close} title="Edit Attendance Notes">
        <Textarea
            label="Notes"
            placeholder="Add notes about this attendance record (e.g., late arrival, early departure)"
            minRows={3}
            value={notes}
            onChange={(event) => setNotes(event.currentTarget.value)}
        />
        <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={close}>Cancel</Button>
            <Button onClick={handleSaveNotes} loading={updateMutation.isPending}>Save</Button>
        </Group>
      </Modal>
    </>
  );
}
