import { ReactNode, useEffect, useState } from 'react';
import { z } from 'zod';
import { Anchor, Group, Loader, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { File } from '@/api/entities/files';
import { getFileInfo, getPresignedDownloadUrl } from '@/api/resources';
import MimeTypeIcon from '@/components/content-type-icon';

interface DownloadButtonProps {
  label: ReactNode;
  handleDownload: () => void;
  isLoading?: boolean;
  mimeType?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  label,
  handleDownload,
  isLoading = false,
  mimeType = 'application/json',
}) => {
  const theme = useMantineTheme();
  return (
    <Group gap="xs">
      {/* {getFileIcon(fileName)} */}

      <Tooltip label="Download">
        <Anchor onClick={handleDownload}>
          <Group gap={5} align="center">
            <MimeTypeIcon color={theme.colors.blue[6]} size={16} mimeType={mimeType} />
            <Text fz="sm">{label}</Text>
          </Group>
        </Anchor>
      </Tooltip>
    </Group>
  );
};

interface FileDownloadButtonProps {
  file_id: string;
  withFileInfo?: true;
}

const downloadFile = async ({ file_id }: FileDownloadButtonProps) => {
  try {
    const downloadUrl = await getPresignedDownloadUrl(file_id);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file_id;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notifications.show({ title: 'Berhasil', message: 'File berhasil diunduh', color: 'green' });
  } catch (error) {
    notifications.show({ message: 'Download failed: ' + error, color: 'red' });
  }
};

export function FileDownloadButton({ file_id, withFileInfo }: FileDownloadButtonProps) {
  const [fileInfo, setFileInfo] = useState<z.infer<typeof File> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (withFileInfo) {
      setIsLoading(true);
      getFileInfo(file_id).then((file_info) => {
        setFileInfo(file_info);
        setIsLoading(false);
      });
    }
  }, [file_id]);

  return withFileInfo ? (
    <DownloadButton
      label={`${fileInfo?.filename} (${fileInfo?.size ? `${(fileInfo?.size / 1024).toFixed(2)} KB` : '-'})`}
      handleDownload={() => downloadFile({ file_id: file_id })}
      isLoading={isLoading}
      mimeType={fileInfo?.content_type}
    />
  ) : (
    <DownloadButton label={''} handleDownload={() => downloadFile({ file_id: file_id })} />
  );
}

interface DataObject {
  [key: string]: any;
}

export function ArrayDownloadButton(data: DataObject[], fileName: string) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);

      if (data.length === 0) {
        console.error('No data available to download.');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map((row) => headers.map((name) => JSON.stringify(row[name] ?? '')).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      notifications.show({
        title: 'Download Successful',
        message: 'File downloaded successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({ message: 'Download failed: ' + error, color: 'red' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DownloadButton label="Export to CSV" handleDownload={handleDownload} isLoading={isLoading} />
  );
}
