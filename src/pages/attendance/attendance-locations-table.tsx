import { AttendanceLocation } from '@/api/entities/attendance';
import { usePagination } from '@/api/helpers';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import {
    useDeleteAttendanceLocation,
    useGetAttendanceLocations,
} from '@/hooks/api/attendance';
import { icons } from '@/utilities/icons';
import { Badge, Button, Modal, Paper, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { DataTableColumn } from 'mantine-datatable';
import { QRCodeCanvas } from 'qrcode.react';
import { useCallback, useMemo, useState } from 'react';
import z from 'zod';
import {
    openAttendanceLocationCreate,
    openAttendanceLocationEdit,
    openAttendanceLocationView,
} from './attendance-locations-modals';

type AttendanceLocationType = z.infer<typeof AttendanceLocation>;

type SortableFields = Pick<
  AttendanceLocationType,
  'location_name' | 'address' | 'latitude' | 'longitude'
>;

export function AttendanceLocationsTable() {
  const { page, limit, setLimit, setPage } = usePagination();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<string | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState<string>('');

  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'asc',
      column: 'location_name',
    },
  });

  const { data, isLoading, refetch } = useGetAttendanceLocations({
    query: {
      page,
      limit,
      sort: sort.query,
    },
  });

  const { mutate: deleteLocation } = useDeleteAttendanceLocation();
  const handleDelete = useCallback(
    (id: string) => {
      modals.openConfirmModal({
        title: 'Delete Attendance Location',
        children: 'Are you sure you want to delete this attendance location?',
        confirmProps: { color: 'red' },
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        onConfirm: () => {
          deleteLocation({ route: { id } });
          refetch();
        },
      });
    },
    [deleteLocation, refetch]
  );

  const handleShowQRCode = (qrData: string, locationName: string) => {
    setSelectedQRCode(qrData);
    setSelectedLocationName(locationName);
    setQrModalOpen(true);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${selectedLocationName.replace(/\s+/g, '_')}_QR.png`;
      link.href = url;
      link.click();
    }
  };

  const columns: DataTableColumn<AttendanceLocationType>[] = useMemo(
    () => [
      {
        accessor: 'location_name',
        title: 'Location Name',
        sortable: true,
      },
      { accessor: 'address', title: 'Address', sortable: true },
      {
        accessor: 'latitude',
        title: 'Coordinates',
        render: ({ latitude, longitude }) => `${latitude?.toFixed(6)}, ${longitude?.toFixed(6)}`,
      },
      {
        accessor: 'radius_meters',
        title: 'Radius',
        render: ({ radius_meters }) => `${radius_meters}m`,
      },
      {
        accessor: 'is_active',
        title: 'Status',
        textAlign: 'center',
        render: ({ is_active }) => (
          <Badge color={is_active ? 'green' : 'gray'} variant="light">
            {is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        accessor: 'qr_code_data',
        title: 'QR Code',
        textAlign: 'center',
        render: ({ qr_code_data, location_name }) =>
          qr_code_data ? (
            <Button
              size="xs"
              variant="light"
              onClick={() => handleShowQRCode(qr_code_data, location_name)}
            >
              View QR
            </Button>
          ) : (
            <Text c="dimmed" size="sm">
              No QR
            </Text>
          ),
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        width: 130,
        render: (row: any) => (
          <DataTable.Actions
            onView={() => openAttendanceLocationView(row.id)}
            onEdit={() => openAttendanceLocationEdit(row.id, refetch)}
            onDelete={() => handleDelete(row.id)}
          />
        ),
      },
    ],
    [handleDelete]
  );

  const Icon = icons.building;

  return (
    <>
      <DataTable.Container>
        <DataTable.Title
          icon={<Icon size={25} />}
          title="Attendance Locations"
          actions={
            <AddButton
              variant="default"
              size="xs"
              onClick={() => openAttendanceLocationCreate(refetch)}
            >
              Add Location
            </AddButton>
          }
        />
        <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
        <DataTable.Content>
          <DataTable.Table
            striped
            minHeight={240}
            noRecordsText={DataTable.noRecordsText('attendance locations')}
            recordsPerPageLabel={DataTable.recordsPerPageLabel('attendance locations')}
            paginationText={DataTable.paginationText('attendance locations')}
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
            pinLastColumn
            highlightOnHover
          />
        </DataTable.Content>
      </DataTable.Container>

      {/* QR Code Modal */}
      <Modal
        opened={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title={`QR Code - ${selectedLocationName}`}
        centered
      >
        <Stack align="center">
          {selectedQRCode && (
            <Paper shadow="xs" p="md" withBorder>
              <QRCodeCanvas id="qr-code-canvas" value={selectedQRCode} size={300} />
            </Paper>
          )}
          <Text size="sm" c="dimmed" ta="center">
            Employees can scan this QR code to check in at this location
          </Text>
          <Button fullWidth onClick={handleDownloadQR}>
            Download QR Code
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
