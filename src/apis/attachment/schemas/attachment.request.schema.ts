import { z } from 'zod';
import { extendZodWithOpenApi, ZodRequestBody } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const UploadAttachmentSchema = z.object({
    cardId: z.uuid().openapi({ description: 'ID of the card' }),
    file: z.any().openapi({ type: 'string', format: 'binary', description: 'File to upload' }),
});
export const UploadAttachmentRequest: ZodRequestBody = {
    description: 'Upload an attachment to a card',
    content: {
        'multipart/form-data': {
            schema: UploadAttachmentSchema,
        },
    },
}
export type UploadAttachment = z.infer<typeof UploadAttachmentSchema>;