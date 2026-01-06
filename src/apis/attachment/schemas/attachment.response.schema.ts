import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const AttachmentResponseSchema = z.object({
    id: z.uuid().openapi({ description: 'The unique identifier of the attachment' }),
    cardId: z.uuid().openapi({ description: 'The unique identifier of the card' }),
    fileUrl: z.string().openapi({ description: 'The URL of the file' }),
    fileName: z.string().openapi({ description: 'The name of the file' }),
    fileType: z.string().openapi({ description: 'The type of the file' }),
    createdAt: z.date().openapi({ description: 'The creation date of the attachment' }),
});

export type AttachmentResponse = z.infer<typeof AttachmentResponseSchema>;

export const ListAttachmentsResponseSchema = z.array(AttachmentResponseSchema);
