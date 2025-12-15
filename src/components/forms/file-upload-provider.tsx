import { createContext, ReactNode, useContext, useState } from 'react';
import invariant from 'tiny-invariant';
import { updateFileMetadata } from '@/api/resources';

interface FileIdContextValues {
  fileIds: string[];
  addFileId: (fileId: string) => void;
  removeFileId: (fileId: string) => void;
  clearFileIds: () => void;
  hasFileId: (fileId: string) => boolean;
  updateFilesMetadata: () => void;
}

interface FileIdProviderProps {
  children: ReactNode;
  fileIdManager: FileIdContextValues;
}

const FileIdContext = createContext<FileIdContextValues>({} as FileIdContextValues);

export function useFileIdContext() {
  const context = useContext(FileIdContext);
  invariant(context, 'useFileIdContext must be used within a FileIdProvider');
  return context;
}

export function useFileIdManager(): FileIdContextValues {
  const [fileIds, setFileIds] = useState<string[]>([]);

  const addFileId = (fileId: string) => {
    setFileIds((prev) => (prev.includes(fileId) ? prev : [...prev, fileId]));
  };

  const removeFileId = (fileId: string) => {
    setFileIds((prev) => prev.filter((id) => id !== fileId));
  };

  const clearFileIds = () => {
    setFileIds([]);
  };

  const hasFileId = (fileId: string) => fileIds.includes(fileId);

  const updateFilesMetadata = () => {
    fileIds.forEach((fileId) => {
      updateFileMetadata(fileId);
    });
  };

  return {
    fileIds,
    addFileId,
    removeFileId,
    clearFileIds,
    hasFileId,
    updateFilesMetadata,
  };
}

export function FileIdProvider({ children, fileIdManager }: FileIdProviderProps) {
  return <FileIdContext.Provider value={fileIdManager}>{children}</FileIdContext.Provider>;
}
