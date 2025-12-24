import { useBulkImportContacts } from '@/hooks/api/contacts';
import {
    Alert,
    Badge,
    Button,
    FileButton,
    Group,
    Modal,
    ScrollArea,
    Stack,
    Table,
    Text,
} from '@mantine/core';
import { IconDownload, IconFileSpreadsheet, IconUpload, IconX } from '@tabler/icons-react';
import Papa from 'papaparse';
import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

interface ImportedContact {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  company?: string;
  regional?: number;
  zone?: string;
  field?: string;
  address?: string;
  notes?: string;
}

// Column mapping from Excel headers to schema fields
const COLUMN_MAP: Record<string, keyof ImportedContact> = {
  'nama': 'name',
  'name': 'name',
  'email': 'email',
  'no. hp': 'phone',
  'no hp': 'phone',
  'phone': 'phone',
  'jabatan': 'position',
  'position': 'position',
  'perusahaan': 'company',
  'company': 'company',
  'regional': 'regional',
  'zona': 'zone',
  'zone': 'zone',
  'field': 'field',
  'address': 'address',
  'alamat': 'address',
  'notes': 'notes',
  'catatan': 'notes',
};

function parseRegional(value: any): number | undefined {
  if (value === null || value === undefined || value === '' || value === '-') {
    return 0;
  }
  const num = parseInt(String(value).replace(/\D/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

function mapRowToContact(row: Record<string, any>): ImportedContact | null {
  const contact: Partial<ImportedContact> = {};
  
  for (const [header, value] of Object.entries(row)) {
    const normalizedHeader = header.toLowerCase().trim();
    const fieldName = COLUMN_MAP[normalizedHeader];
    
    if (fieldName) {
      if (fieldName === 'regional') {
        contact[fieldName] = parseRegional(value);
      } else {
        contact[fieldName] = value?.toString()?.trim() || undefined;
      }
    }
  }
  
  // Name is required
  if (!contact.name) {
    return null;
  }
  
  return contact as ImportedContact;
}

interface ContactImportProps {
  onSuccess: () => void;
}

export function ContactImport({ onSuccess }: ContactImportProps) {
  const [opened, setOpened] = useState(false);
  const [parsedData, setParsedData] = useState<ImportedContact[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const resetRef = useRef<() => void>(null);
  
  const { mutate: bulkImport, isPending } = useBulkImportContacts();

  const handleFile = (file: File | null) => {
    if (!file) return;
    
    setError('');
    setFileName(file.name);
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'csv') {
      // Parse CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const contacts = results.data
            .map((row: any) => mapRowToContact(row))
            .filter((c): c is ImportedContact => c !== null);
          
          if (contacts.length === 0) {
            setError('No valid contacts found. Make sure the file has a "Nama" or "Name" column.');
          } else {
            setParsedData(contacts);
            setOpened(true);
          }
        },
        error: (err) => {
          setError(`Error parsing CSV: ${err.message}`);
        },
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      // Parse Excel
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          const contacts = jsonData
            .map((row: any) => mapRowToContact(row))
            .filter((c): c is ImportedContact => c !== null);
          
          if (contacts.length === 0) {
            setError('No valid contacts found. Make sure the file has a "Nama" or "Name" column.');
          } else {
            setParsedData(contacts);
            setOpened(true);
          }
        } catch (err: any) {
          setError(`Error parsing Excel: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Unsupported file format. Please use .xlsx, .xls, or .csv');
    }
    
    resetRef.current?.();
  };

  const handleImport = () => {
    bulkImport(
      { variables: parsedData as any },
      {
        onSuccess: () => {
          setOpened(false);
          setParsedData([]);
          setFileName('');
          onSuccess();
        },
      }
    );
  };

  const handleClose = () => {
    setOpened(false);
    setParsedData([]);
    setFileName('');
    setError('');
  };

  const downloadTemplate = () => {
    // Create template with headers
    const template = [
      {
        'Nama': '',
        'Perusahaan': '',
        'Regional': '',
        'Zona': '',
        'Field': '',
        'Email': '',
        'No. Hp': '',
        'Jabatan': '',
        'Address': '',
        'Notes': '',
      },
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 25 }, // Nama
      { wch: 25 }, // Perusahaan
      { wch: 12 }, // Regional
      { wch: 15 }, // Zona
      { wch: 15 }, // Field
      { wch: 25 }, // Email
      { wch: 15 }, // No. Hp
      { wch: 20 }, // Jabatan
      { wch: 30 }, // Address
      { wch: 30 }, // Notes
    ];
    
    XLSX.writeFile(workbook, 'contacts_template.xlsx');
  };

  return (
    <>
      <Group gap="xs">
        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconDownload size={16} />}
          onClick={downloadTemplate}
        >
          Template
        </Button>
        <FileButton
          resetRef={resetRef}
          onChange={handleFile}
          accept=".xlsx,.xls,.csv"
        >
          {(props) => (
            <Button
              {...props}
              variant="light"
              size="xs"
              leftSection={<IconFileSpreadsheet size={16} />}
            >
              Import Excel
            </Button>
          )}
        </FileButton>
      </Group>

      {error && (
        <Alert color="red" mt="sm" withCloseButton onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Modal
        opened={opened}
        onClose={handleClose}
        title={`Import Contacts from ${fileName}`}
        size="xl"
        zIndex={2000}
      >
        <Stack>
          <Group>
            <Badge size="lg" color="blue">
              {parsedData.length} contacts ready to import
            </Badge>
          </Group>

          <ScrollArea h={400}>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>No</Table.Th>
                  <Table.Th>Nama</Table.Th>
                  <Table.Th>Perusahaan</Table.Th>
                  <Table.Th>Regional</Table.Th>
                  <Table.Th>Zona</Table.Th>
                  <Table.Th>Field</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>No. Hp</Table.Th>
                  <Table.Th>Jabatan</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {parsedData.slice(0, 100).map((contact, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{contact.name}</Table.Td>
                    <Table.Td>{contact.company || '-'}</Table.Td>
                    <Table.Td>
                      {contact.regional === 0 || !contact.regional
                        ? '-'
                        : `Regional ${contact.regional}`}
                    </Table.Td>
                    <Table.Td>{contact.zone || '-'}</Table.Td>
                    <Table.Td>{contact.field || '-'}</Table.Td>
                    <Table.Td>{contact.email || '-'}</Table.Td>
                    <Table.Td>{contact.phone || '-'}</Table.Td>
                    <Table.Td>{contact.position || '-'}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            {parsedData.length > 100 && (
              <Text size="sm" c="dimmed" mt="sm">
                Showing first 100 of {parsedData.length} contacts
              </Text>
            )}
          </ScrollArea>

          <Group justify="flex-end">
            <Button variant="subtle" onClick={handleClose} leftSection={<IconX size={16} />}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              loading={isPending}
              leftSection={<IconUpload size={16} />}
            >
              Import {parsedData.length} Contacts
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
