import { z } from 'zod';

export const File = z.object({
    id: z.string().uuid(),
    filename: z.string(),
    content_type: z.string(),
    size: z.number(),
    etag: z.string(),
    key: z.string(),
    upload_date: z.string(),
    status: z.enum(['PENDING', 'UPLOADED']),
    headers: z.array(z.string()).optional().nullable()
});

export const FileUpload = z.object({
    "presigned_url": z.string(),
    "file_id": z.string().uuid()
})