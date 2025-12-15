import React from 'react';
import {
  PiFileText,
  PiFileImage,
  PiFileVideo,
  PiFileAudio,
  PiFilePdf,
  PiFileDoc,
  PiFileArchive,
  PiFileCode,
  PiFile,
} from 'react-icons/pi';

interface MimeTypeIconProps {
  mimeType: string;
  size?: number;
  color?: string;
}

const mimeTypeCategoryMap: Record<string, string> = {
  // Application
  'application/pdf': 'pdf',
  'application/json': 'code',
  'application/xml': 'code',
  'application/javascript': 'code',
  'application/octet-stream': 'archive',

  // Audio
  'audio/mpeg': 'audio',
  'audio/x-wav': 'audio',

  // Image
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',

  // Video
  'video/mp4': 'video',
  'video/webm': 'video',

  // Text
  'text/plain': 'text',
  'text/html': 'text',
  'text/css': 'text',
  'text/javascript': 'text',

  // Word
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',

  // Excel
  'application/vnd.ms-excel': 'excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',

  // PowerPoint
  'application/vnd.ms-powerpoint': 'presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',

  // Archive
  'application/zip': 'archive',
  'application/x-rar-compressed': 'archive',
  'application/x-tar': 'archive',

  // Unknown
  'unknown': 'file',
};

const iconMap: Record<string, JSX.Element> = {
  text: <PiFileText />,
  image: <PiFileImage />,
  video: <PiFileVideo />,
  audio: <PiFileAudio />,
  pdf: <PiFilePdf />,
  word: <PiFileDoc />,
  excel: <PiFileDoc />,
  archive: <PiFileArchive />,
  code: <PiFileCode />,
  presentation: <PiFile />,
  file: <PiFile />,
};

const MimeTypeIcon: React.FC<MimeTypeIconProps> = ({
  mimeType,
  size = 24,
  color = 'black',
}) => {
  const category = mimeTypeCategoryMap[mimeType] || 'unknown';
  const icon = iconMap[category] || iconMap['file'];

  return React.cloneElement(icon, { size, color });
};

export default MimeTypeIcon;
