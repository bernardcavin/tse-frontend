import { client } from '@/api/axios';
import { BackendResponse } from '@/api/entities';
import { ContactType, formatRegional } from '@/api/entities/contact';
import { usePagination } from '@/api/helpers';
import { AddButton } from '@/components/add-button';
import { DataTable } from '@/components/data-table';
import { useDeleteContact, useGetContacts } from '@/hooks/api/contacts';
import { icons } from '@/utilities/icons';
import { Button, Group, Select, TextInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconDownload } from '@tabler/icons-react';
import { DataTableColumn } from 'mantine-datatable';
import { useCallback, useMemo, useState } from 'react';
import { ContactImport } from './contacts-import';
import { openContactCreate, openContactEdit, openContactView } from './contacts-modals';

type SortableFields = Pick<
  ContactType,
  'name' | 'company' | 'regional' | 'zone' | 'field' | 'position'
>;

// Export data fetching function
async function fetchExportData(): Promise<Array<Record<string, string>>> {
  const response = await client.get('/contacts/export/csv');
  return BackendResponse.parse(response.data).data as Array<Record<string, string>>;
}

// Export to CSV utility
function downloadCSV(data: Array<Record<string, string>>, filename: string) {
  if (data.length === 0) return;
  
  // Define Indonesian headers
  const headerMap: Record<string, string> = {
    name: 'Nama',
    company: 'Perusahaan',
    regional: 'Regional',
    zone: 'Zona',
    field: 'Field',
    email: 'Email',
    phone: 'No. Hp',
    position: 'Jabatan',
    address: 'Alamat',
    notes: 'Catatan',
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

export function ContactsTable() {
  const { page, limit, setLimit, setPage } = usePagination();
  const { filters, sort } = DataTable.useDataTable<SortableFields>({
    sortConfig: {
      direction: 'asc',
      column: 'name',
    },
  });
  
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, refetch } = useGetContacts({
    query: {
      page,
      limit,
      sort: sort.query,
      filter: JSON.stringify(filters.filters),
    },
  });

  const { mutate: deleteContact } = useDeleteContact();
  const handleDelete = useCallback(
    (id: string) => {
      modals.openConfirmModal({
        title: 'Delete Contact',
        children: 'Are you sure you want to delete this contact?',
        confirmProps: { color: 'red' },
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        onConfirm: () => {
          deleteContact({ route: { id } });
          refetch();
        },
      });
    },
    [deleteContact, refetch]
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
      const filename = `contacts_${dateStr}.csv`;
      
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

  const columns: DataTableColumn<ContactType>[] = useMemo(
    () => [
      {
        accessor: 'name',
        title: 'Nama',
        sortable: true,
        filtering: Boolean(filters.filters.name),
        filter: (
          <TextInput
            label="Nama"
            description="Filter by name"
            placeholder="e.g. John Doe"
            value={(filters.filters.name?.value as string) ?? ''}
            onChange={(e) => {
              filters.change({
                name: 'name',
                label: 'Nama',
                value: e.currentTarget.value,
              });
              setPage(1);
            }}
          />
        ),
      },
      {
        accessor: 'company',
        title: 'Perusahaan',
        sortable: true,
        filtering: Boolean(filters.filters.company),
        filter: (
          <TextInput
            label="Perusahaan"
            description="Filter by company"
            placeholder="e.g. PT. Example"
            value={(filters.filters.company?.value as string) ?? ''}
            onChange={(e) => {
              filters.change({
                name: 'company',
                label: 'Perusahaan',
                value: e.currentTarget.value,
              });
              setPage(1);
            }}
          />
        ),
      },
      {
        accessor: 'regional',
        title: 'Regional',
        sortable: true,
        filtering: Boolean(filters.filters.regional),
        render: ({ regional }) => formatRegional(regional),
        filter: (
          <Select
            label="Regional"
            description="Filter by regional"
            placeholder="Select regional"
            value={(filters.filters.regional?.value as string) ?? ''}
            onChange={(value) => {
              if (value !== null) {
                filters.change({
                  name: 'regional',
                  label: 'Regional',
                  value: value,
                });
              } else {
                filters.remove('regional');
              }
              setPage(1);
            }}
            data={[
              { value: '1', label: 'Regional 1' },
              { value: '2', label: 'Regional 2' },
              { value: '3', label: 'Regional 3' },
              { value: '4', label: 'Regional 4' },
              { value: '5', label: 'Regional 5' },
              { value: '6', label: 'Regional 6' },
            ]}
            clearable
          />
        ),
      },
      {
        accessor: 'zone',
        title: 'Zona',
        sortable: true,
        filtering: Boolean(filters.filters.zone),
        render: ({ zone }) => zone || '-',
        filter: (
          <TextInput
            label="Zona"
            description="Filter by zone"
            placeholder="e.g. Zona A"
            value={(filters.filters.zone?.value as string) ?? ''}
            onChange={(e) => {
              filters.change({
                name: 'zone',
                label: 'Zona',
                value: e.currentTarget.value,
              });
              setPage(1);
            }}
          />
        ),
      },
      {
        accessor: 'field',
        title: 'Field',
        sortable: true,
        filtering: Boolean(filters.filters.field),
        render: ({ field }) => field || '-',
        filter: (
          <TextInput
            label="Field"
            description="Filter by field"
            placeholder="e.g. Field A"
            value={(filters.filters.field?.value as string) ?? ''}
            onChange={(e) => {
              filters.change({
                name: 'field',
                label: 'Field',
                value: e.currentTarget.value,
              });
              setPage(1);
            }}
          />
        ),
      },
      {
        accessor: 'email',
        title: 'Email',
        filtering: Boolean(filters.filters.email),
        render: ({ email }) => email || '-',
        filter: (
          <TextInput
            label="Email"
            description="Filter by email"
            placeholder="e.g. john@example.com"
            value={(filters.filters.email?.value as string) ?? ''}
            onChange={(e) => {
              filters.change({
                name: 'email',
                label: 'Email',
                value: e.currentTarget.value,
              });
              setPage(1);
            }}
          />
        ),
      },
      {
        accessor: 'phone',
        title: 'No. Hp',
        filtering: Boolean(filters.filters.phone),
        render: ({ phone }) => phone || '-',
        filter: (
          <TextInput
            label="No. Hp"
            description="Filter by phone number"
            placeholder="e.g. 0812..."
            value={(filters.filters.phone?.value as string) ?? ''}
            onChange={(e) => {
              filters.change({
                name: 'phone',
                label: 'No. Hp',
                value: e.currentTarget.value,
              });
              setPage(1);
            }}
          />
        ),
      },
      {
        accessor: 'position',
        title: 'Jabatan',
        sortable: true,
        filtering: Boolean(filters.filters.position),
        render: ({ position }) => position || '-',
        filter: (
          <TextInput
            label="Jabatan"
            description="Filter by position"
            placeholder="e.g. Manager"
            value={(filters.filters.position?.value as string) ?? ''}
            onChange={(e) => {
              filters.change({
                name: 'position',
                label: 'Jabatan',
                value: e.currentTarget.value,
              });
              setPage(1);
            }}
          />
        ),
      },
      {
        accessor: 'actions',
        title: 'Actions',
        textAlign: 'right',
        width: 130,
        render: (row: any) => (
          <DataTable.Actions
            onView={() => openContactView(row.id)}
            onEdit={() => openContactEdit(row.id, refetch)}
            onDelete={() => handleDelete(row.id)}
          />
        ),
      },
    ],
    [handleDelete, refetch, filters, setPage]
  );

  const Icon = icons.contacts;

  return (
    <DataTable.Container>
      <DataTable.Title
        icon={<Icon size={25} />}
        title="Contacts"
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
            <ContactImport onSuccess={refetch} />
            <AddButton variant="default" size="xs" onClick={() => openContactCreate(refetch)}>
              Add Contact
            </AddButton>
          </Group>
        }
      />
      <DataTable.Filters filters={filters.filters} onClear={filters.clear} />
      <DataTable.Content>
        <DataTable.Table
          striped
          minHeight={240}
          noRecordsText={DataTable.noRecordsText('contacts')}
          recordsPerPageLabel={DataTable.recordsPerPageLabel('contacts')}
          paginationText={DataTable.paginationText('contacts')}
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
          pinFirstColumn
          highlightOnHover
        />
      </DataTable.Content>
    </DataTable.Container>
  );
}
