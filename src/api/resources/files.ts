import { z } from 'zod';
import { FileWithPath } from '@mantine/dropzone';
import { client } from '../axios';
import { BackendResponse } from '../entities';
import { File, FileUpload } from '../entities/files';

export const uploadFile = async (file: FileWithPath): Promise<any> => {
  try {
    // Step 1: Get presigned URL from backend
    const presignedResponse = await client.get('/files/upload-url', {
      params: { filename: file.name, size: file.size },
    });

    const { presigned_url, file_id } = FileUpload.parse(
      BackendResponse.parse(presignedResponse.data).data
    );

    // Upload to S3
    const uploadResponse = await fetch(presigned_url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed: ${uploadResponse.statusText}`);
    }

    return {
      file_info: {
        id: file_id,
        filename: file.name,
        size: file.size,
        contentType: file.type,
      },
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

type FileInfo = z.infer<typeof File>;

export const getFileInfo = async (fileId: string): Promise<FileInfo> => {
  try {
    const response = await client.get(`/files/${fileId}/metadata`);
    return File.parse(BackendResponse.parse(response.data).data);
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
};

export const getPresignedDownloadUrl = async (fileId: string): Promise<string> => {
  try {
    const response = await client.get(`files/${fileId}/download`);
    return BackendResponse.parse(response.data).data;
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
};

type GetImageUrlOptions = {
  width?: number;
  height?: number;
  resize_type?: 'fit' | 'fill' | 'fill-down' | 'force' | 'auto';
  enlarge?: boolean;
  extension?: string;
};

export const getImageUrl = async (
  fileId: string,
  options: GetImageUrlOptions = {}
): Promise<string> => {
  try {
    const response = await client.get(`files/${fileId}/image`, {
      params: {
        width: options.width,
        height: options.height,
        resize_type: options.resize_type ?? 'fit',
        enlarge: options.enlarge ?? true,
        extension: options.extension ?? 'jpg',
      },
    });

    return BackendResponse.parse(response.data).data;
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error;
  }
};

export const updateFileMetadata = async (fileId: string): Promise<any> => {
  try {
    const response = await client.patch(`files/${fileId}/update-metadata`);
    return BackendResponse.parse(response.data).data;
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
};

export const updateFileHeaders = async (fileId: string, headers: string[]): Promise<any> => {
  try {
    const response = await client.patch(`files/${fileId}/update-headers`, { headers });
    return BackendResponse.parse(response.data).data;
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
};
