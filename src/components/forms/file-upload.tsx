import { forwardRef, useEffect, useState } from 'react';
import {
  IconCheck,
  IconDownload,
  IconPhoto,
  IconTable,
  IconTrash,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import * as XLSX from 'xlsx';
import {
  ActionIcon,
  Button,
  ButtonProps,
  Center,
  FileButton,
  Group,
  Image,
  InputWrapper,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { Dropzone, DropzoneProps, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import {
  getFileInfo,
  getPresignedDownloadUrl,
  updateFileHeaders,
  uploadFile,
} from '@/api/resources';
import { useFileIdContext } from './file-upload-provider';
import { useForm } from './form-provider';

export interface FileUploadProps {
  name: string;
  title: string;
  description?: string;
  multiple?: boolean;
}

export const ImageUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ name, title, description, multiple = false, ...props }, ref) => {
    const form = useForm();
    const { addFileId, removeFileId } = useFileIdContext();
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [fileIds, setFileIds] = useState<string[]>([]);
    const [fileInfos, setFileInfos] = useState<Record<string, any>>({});
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
    const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
    const [deletingLocalIndex, setDeletingLocalIndex] = useState<number | null>(null);

    form.watch(name, ({ previousValue, value, touched, dirty }) => {
      if (value === null) return;
      if (value === previousValue) return;

      setLoading(true);
      const ids = multiple ? (Array.isArray(value) ? value : [value]) : [value];

      Promise.all(
        ids.map(async (id) => {
          try {
            const file_info = await getFileInfo(id);
            const url = await getPresignedDownloadUrl(id);
            return { id, file_info, url };
          } catch {
            return null;
          }
        })
      ).then((results) => {
        const validResults = results.filter((r) => r !== null);
        const newFileInfos: Record<string, any> = {};
        const newImageUrls: Record<string, string> = {};
        const newFileIds: string[] = [];

        validResults.forEach((result) => {
          if (result) {
            newFileInfos[result.id] = result.file_info;
            newImageUrls[result.id] = result.url;
            newFileIds.push(result.id);
          }
        });

        setFileInfos(newFileInfos);
        setImageUrls(newImageUrls);
        setFileIds(newFileIds);
        setLoading(false);
      });
    });

    function preview() {
      const hasExistingFiles = fileIds.length > 0 && Object.keys(fileInfos).length > 0;
      const hasLocalFiles = files.length > 0;

      if (!hasExistingFiles && !hasLocalFiles) return null;

      return (
        <InputWrapper required label={title} description={description}>
          <Paper withBorder radius="md" mt="xs">
            {loading ? (
              <Center h={200}>
                <Loader color="blue" size="xl" />
              </Center>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Preview</Table.Th>
                    <Table.Th>Filename</Table.Th>
                    <Table.Th>Size</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {/* Render existing files from server */}
                  {fileIds.map((fileId) => {
                    const fileInfo = fileInfos[fileId];
                    const imageUrl = imageUrls[fileId];
                    if (!fileInfo) return null;

                    const isDeleting = deletingFileId === fileId;

                    return (
                      <Table.Tr key={fileId}>
                        <Table.Td>
                          {imageUrl && <Image src={imageUrl} w={60} h={60} fit="cover" />}
                        </Table.Td>
                        <Table.Td>
                          <Text>
                            {fileInfo.filename.length > 40
                              ? `${fileInfo.filename.substring(0, 37)}...`
                              : fileInfo.filename}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {fileInfo.size ? `${(fileInfo.size / 1024).toFixed(2)} KB` : '-'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          {isDeleting ? (
                            <Group gap="xs">
                              <Tooltip label="Confirm delete" position="bottom">
                                <ActionIcon
                                  onClick={() => handleFileDeletion(fileId)}
                                  variant="filled"
                                  color="red"
                                  size="sm"
                                >
                                  <IconCheck size={16} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Cancel" position="bottom">
                                <ActionIcon
                                  onClick={() => setDeletingFileId(null)}
                                  variant="default"
                                  size="sm"
                                >
                                  <IconX size={16} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          ) : (
                            <Tooltip label="Delete file" position="bottom">
                              <ActionIcon
                                onClick={() => setDeletingFileId(fileId)}
                                variant="filled"
                                color="red"
                                size="sm"
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}

                  {/* Render local files being uploaded */}
                  {files.map((file, index) => {
                    const localImageUrl = URL.createObjectURL(file);
                    const isDeleting = deletingLocalIndex === index;

                    return (
                      <Table.Tr key={`local-${index}`}>
                        <Table.Td>
                          <Image
                            src={localImageUrl}
                            onLoad={() => URL.revokeObjectURL(localImageUrl)}
                            w={60}
                            h={60}
                            fit="cover"
                          />
                        </Table.Td>
                        <Table.Td>
                          <Text>
                            {file.name.length > 40 ? `${file.name.substring(0, 37)}...` : file.name}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {(file.size / 1024).toFixed(2)} KB
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          {isDeleting ? (
                            <Group gap="xs">
                              <Tooltip label="Confirm delete" position="bottom">
                                <ActionIcon
                                  onClick={() => handleLocalFileDeletion(index)}
                                  variant="filled"
                                  color="red"
                                  size="sm"
                                >
                                  <IconCheck size={16} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Cancel" position="bottom">
                                <ActionIcon
                                  onClick={() => setDeletingLocalIndex(null)}
                                  variant="default"
                                  size="sm"
                                >
                                  <IconX size={16} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          ) : (
                            <Tooltip label="Delete file" position="bottom">
                              <ActionIcon
                                onClick={() => setDeletingLocalIndex(index)}
                                variant="filled"
                                color="red"
                                size="sm"
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            )}
          </Paper>
        </InputWrapper>
      );
    }

    const handleFileUpload = async (uploadFiles: FileWithPath[]) => {
      setUploading(true);

      try {
        const uploadPromises = uploadFiles.map((file) => uploadFile(file));
        const responses = await Promise.all(uploadPromises);

        const newFileIds = responses.map((response) => response.file_info.id);
        newFileIds.forEach((id) => addFileId(id));

        if (multiple) {
          const currentIds = fileIds.length > 0 ? fileIds : [];
          const updatedIds = [...currentIds, ...newFileIds];
          form.setFieldValue(name, updatedIds);
          setFileIds(updatedIds);
        } else {
          form.setFieldValue(name, newFileIds[0]);
          setFileIds([newFileIds[0]]);
        }

        notifications.show({
          title: 'Berhasil',
          message: `${uploadFiles.length} file berhasil diupload`,
          color: 'green',
        });
      } catch (error) {
        notifications.show({ message: 'Upload failed: ' + error, color: 'red' });
      } finally {
        setUploading(false);
      }
    };

    const handleFileDeletion = (fileId: string) => {
      removeFileId(fileId);
      const newFileIds = fileIds.filter((id) => id !== fileId);
      const newFileInfos = { ...fileInfos };
      delete newFileInfos[fileId];
      const newImageUrls = { ...imageUrls };
      delete newImageUrls[fileId];

      setFileIds(newFileIds);
      setFileInfos(newFileInfos);
      setImageUrls(newImageUrls);
      setDeletingFileId(null);

      if (multiple) {
        form.setFieldValue(name, newFileIds.length > 0 ? newFileIds : null);
      } else {
        form.setFieldValue(name, null);
      }
    };

    const handleLocalFileDeletion = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      setDeletingLocalIndex(null);
    };

    const shouldShowDropzone = multiple || fileIds.length === 0;

    return (
      <>
        {preview()}
        {shouldShowDropzone && (
          <InputWrapper
            required
            label={!preview() ? title : undefined}
            description={!preview() ? description : undefined}
            error={form.errors.files}
          >
            <Dropzone
              multiple={multiple}
              h={200}
              p={0}
              accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.svg]}
              onDrop={handleFileUpload}
              onReject={() => form.setFieldError('files', 'Select images only')}
              loading={uploading}
              mb="xs"
              mt="xs"
            >
              <Center h={200}>
                <Stack
                  justify="center"
                  align="center"
                  gap="sm"
                  mih={120}
                  style={{ pointerEvents: 'none' }}
                >
                  <Dropzone.Accept>
                    <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconPhoto size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                  </Dropzone.Idle>
                  <Stack gap={0}>
                    <Text size="xl" ta="center">
                      Upload or drag and drop {multiple ? 'files' : 'file'}
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">
                      File should be in .png format and should not exceed 5mb
                    </Text>
                  </Stack>
                </Stack>
              </Center>
            </Dropzone>
          </InputWrapper>
        )}
      </>
    );
  }
);

export interface FileUploadButtonProps extends ButtonProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  multiple?: boolean;
}

export const FileUploadButton = forwardRef<HTMLInputElement, FileUploadButtonProps>(
  ({ name, label, description, required, multiple = false, ...props }, ref) => {
    const form = useForm();
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [fileIds, setFileIds] = useState<string[]>([]);
    const [fileInfos, setFileInfos] = useState<Record<string, any>>({});
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
    const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
    const [deletingLocalIndex, setDeletingLocalIndex] = useState<number | null>(null);
    const { addFileId, removeFileId } = useFileIdContext();

    // Handle initial form value on mount
    useEffect(() => {
      const initialValue = name.split('.').reduce((obj, key) => obj?.[key], form.getValues());
      if (initialValue) {
        const ids = multiple
          ? Array.isArray(initialValue)
            ? initialValue
            : [initialValue]
          : [initialValue];

        setLoading(true);
        Promise.all(
          ids.map(async (id) => {
            try {
              const file_info = await getFileInfo(id);
              return { id, file_info };
            } catch {
              return null;
            }
          })
        ).then((results) => {
          const validResults = results.filter((r) => r !== null);
          const newFileInfos: Record<string, any> = {};
          const newFileIds: string[] = [];

          validResults.forEach((result) => {
            if (result) {
              newFileInfos[result.id] = result.file_info;
              newFileIds.push(result.id);
            }
          });

          setFileInfos(newFileInfos);
          setFileIds(newFileIds);
          setLoading(false);
        });
      }
    }, []);

    // Watch for form field changes
    form.watch(name, ({ previousValue, value, touched, dirty }) => {
      if (value === null) {
        setFiles([]);
        setFileIds([]);
        setFileInfos({});
        return;
      }
      if (value === previousValue) return;

      const ids = multiple ? (Array.isArray(value) ? value : [value]) : [value];
      const currentIds = fileIds.join(',');
      const newIds = ids.join(',');
      if (currentIds === newIds) return;

      setLoading(true);
      Promise.all(
        ids.map(async (id) => {
          try {
            const file_info = await getFileInfo(id);
            return { id, file_info };
          } catch {
            return null;
          }
        })
      ).then((results) => {
        const validResults = results.filter((r) => r !== null);
        const newFileInfos: Record<string, any> = {};
        const newFileIds: string[] = [];

        validResults.forEach((result) => {
          if (result) {
            newFileInfos[result.id] = result.file_info;
            newFileIds.push(result.id);
          }
        });

        setFileInfos(newFileInfos);
        setFileIds(newFileIds);
        setLoading(false);
      });
    });

    function preview() {
      const hasExistingFiles = fileIds.length > 0 && Object.keys(fileInfos).length > 0;
      const hasLocalFiles = files.length > 0;

      if (!hasExistingFiles && !hasLocalFiles) return null;

      return (
        <InputWrapper required={required} label={label} description={description}>
          <Paper withBorder radius="md" mt="xs">
            {loading ? (
              <Center h={200}>
                <Loader color="blue" size="xl" />
              </Center>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Filename</Table.Th>
                    <Table.Th>Size</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {/* Render existing files from server */}
                  {fileIds.map((fileId) => {
                    const fileInfo = fileInfos[fileId];
                    if (!fileInfo) return null;

                    const isDeleting = deletingFileId === fileId;

                    return (
                      <Table.Tr key={fileId}>
                        <Table.Td>
                          <Text>
                            {fileInfo.filename.length > 50
                              ? `${fileInfo.filename.substring(0, 47)}...`
                              : fileInfo.filename}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {fileInfo.size ? `${(fileInfo.size / 1024).toFixed(2)} KB` : '-'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            {!isDeleting && (
                              <Tooltip label="Download file" position="bottom">
                                <ActionIcon
                                  onClick={() => handleFileDownload(fileId)}
                                  variant="default"
                                  size="sm"
                                >
                                  {downloadingIds.has(fileId) ? (
                                    <Loader color="blue" size="xs" />
                                  ) : (
                                    <IconDownload size={16} stroke={2} />
                                  )}
                                </ActionIcon>
                              </Tooltip>
                            )}
                            {isDeleting ? (
                              <>
                                <Tooltip label="Confirm delete" position="bottom">
                                  <ActionIcon
                                    onClick={() => handleFileDeletion(fileId)}
                                    variant="filled"
                                    color="red"
                                    size="sm"
                                  >
                                    <IconCheck size={16} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Cancel" position="bottom">
                                  <ActionIcon
                                    onClick={() => setDeletingFileId(null)}
                                    variant="default"
                                    size="sm"
                                  >
                                    <IconX size={16} />
                                  </ActionIcon>
                                </Tooltip>
                              </>
                            ) : (
                              <Tooltip label="Delete file" position="bottom">
                                <ActionIcon
                                  onClick={() => setDeletingFileId(fileId)}
                                  variant="filled"
                                  color="red"
                                  size="sm"
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}

                  {/* Render local files being uploaded */}
                  {files.map((file, index) => {
                    const isDeleting = deletingLocalIndex === index;

                    return (
                      <Table.Tr key={`local-${index}`}>
                        <Table.Td>
                          <Text>
                            {file.name.length > 50 ? `${file.name.substring(0, 47)}...` : file.name}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {(file.size / 1024).toFixed(2)} KB
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          {isDeleting ? (
                            <Group gap="xs">
                              <Tooltip label="Confirm delete" position="bottom">
                                <ActionIcon
                                  onClick={() => handleLocalFileDeletion(index)}
                                  variant="filled"
                                  color="red"
                                  size="sm"
                                >
                                  <IconCheck size={16} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Cancel" position="bottom">
                                <ActionIcon
                                  onClick={() => setDeletingLocalIndex(null)}
                                  variant="default"
                                  size="sm"
                                >
                                  <IconX size={16} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          ) : (
                            <Tooltip label="Delete file" position="bottom">
                              <ActionIcon
                                onClick={() => setDeletingLocalIndex(index)}
                                variant="filled"
                                color="red"
                                size="sm"
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            )}
          </Paper>
        </InputWrapper>
      );
    }

    const handleFileUpload = async (uploadFiles: FileWithPath | FileWithPath[]) => {
      const filesToUpload = Array.isArray(uploadFiles) ? uploadFiles : [uploadFiles];
      setUploading(true);

      try {
        const uploadPromises = filesToUpload.map((file) => uploadFile(file));
        const responses = await Promise.all(uploadPromises);

        const newFileIds = responses.map((response) => response.file_info.id);
        newFileIds.forEach((id) => addFileId(id));

        if (multiple) {
          const currentIds = fileIds.length > 0 ? fileIds : [];
          const updatedIds = [...currentIds, ...newFileIds];
          form.setFieldValue(name, updatedIds);
          setFileIds(updatedIds);
        } else {
          form.setFieldValue(name, newFileIds[0]);
          setFileIds([newFileIds[0]]);
        }

        notifications.show({
          title: 'Berhasil',
          message: `${filesToUpload.length} file berhasil diupload`,
          color: 'green',
        });
      } catch (error) {
        notifications.show({ message: 'Upload failed: ' + error, color: 'red' });
      } finally {
        setUploading(false);
      }
    };

    const handleFileDownload = async (fileId: string) => {
      const fileInfo = fileInfos[fileId];
      if (!fileInfo) return;

      setDownloadingIds((prev) => new Set(prev).add(fileId));
      try {
        const downloadUrl = await getPresignedDownloadUrl(fileId);

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileInfo.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        notifications.show({ title: 'Berhasil', message: 'File berhasil diunduh', color: 'green' });
      } catch (error) {
        notifications.show({ message: 'Download failed: ' + error, color: 'red' });
      } finally {
        setDownloadingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }
    };

    const handleFileDeletion = (fileId: string) => {
      removeFileId(fileId);
      const newFileIds = fileIds.filter((id) => id !== fileId);
      const newFileInfos = { ...fileInfos };
      delete newFileInfos[fileId];

      setFileIds(newFileIds);
      setFileInfos(newFileInfos);
      setDeletingFileId(null);

      if (multiple) {
        form.setFieldValue(name, newFileIds.length > 0 ? newFileIds : null);
      } else {
        form.setFieldValue(name, null);
      }
    };

    const handleLocalFileDeletion = (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      setDeletingLocalIndex(null);
    };

    const shouldShowUploadButton = multiple || fileIds.length === 0;

    return (
      <>
        {preview()}
        {shouldShowUploadButton && (
          <InputWrapper
            required={required}
            label={!preview() ? label : undefined}
            description={!preview() ? description : undefined}
          >
            <Group gap="xs" align="center" mt="xs">
              <FileButton onChange={(file) => file && handleFileUpload(file)} multiple={multiple}>
                {(props) => (
                  <Button
                    leftSection={<IconUpload size={16} stroke={2} />}
                    loading={uploading}
                    {...props}
                  >
                    Upload {multiple ? 'Files' : 'File'}
                  </Button>
                )}
              </FileButton>
            </Group>
          </InputWrapper>
        )}
      </>
    );
  }
);
