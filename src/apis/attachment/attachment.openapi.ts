import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { AttachmentResponseSchema, ListAttachmentsResponseSchema } from './schemas/attachment.response.schema';
import { UploadAttachmentRequest } from './schemas/attachment.request.schema';

extendZodWithOpenApi(z);

export const attachmentRegistry = new OpenAPIRegistry();
attachmentRegistry.register('Attachments', AttachmentResponseSchema);

export function registerAttachmentPaths() {
    attachmentRegistry.registerPath({
        method: 'post',
        path: '/api/v1/attachments',
        tags: ['Attachment'],
        summary: 'Upload an attachment to a card',
        security: [{ bearerAuth: [] }],
        request: {
            body: UploadAttachmentRequest
        },
        responses: {
            201: {
                description: 'Attachment uploaded successfully',
                content: {
                    'application/json': {
                        schema: z.object({
                            message: z.string(),
                            statusCode: z.number(),
                            data: AttachmentResponseSchema
                        })
                    }
                }
            },
            500: {
                description: 'Internal Server Error'
            }
        }
    });

    attachmentRegistry.registerPath({
        method: 'delete',
        path: '/api/v1/attachments/{id}',
        tags: ['Attachment'],
        summary: 'Delete an attachment',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({ description: 'ID of the attachment' }),
            }),
        },
        responses: {
            200: {
                description: 'Attachment deleted successfully',
                content: {
                    'application/json': {
                        schema: z.object({
                            message: z.string(),
                            statusCode: z.number(),
                            data: z.null()
                        })
                    }
                }
            },
            404: {
                description: 'Attachment not found'
            },
            500: {
                description: 'Internal Server Error'
            }
        }
    });

    attachmentRegistry.registerPath({
        method: 'get',
        path: '/api/v1/attachments/card/{cardId}',
        tags: ['Attachment'],
        summary: 'Get all attachments of a card',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                cardId: z.uuid().openapi({ description: 'ID of the card' }),
            }),
        },
        responses: {
            200: {
                description: 'Get attachments successfully',
                content: {
                    'application/json': {
                        schema: z.object({
                            message: z.string(),
                            statusCode: z.number(),
                            data: ListAttachmentsResponseSchema
                        })
                    }
                }
            },
            404: {
                description: 'Card not found'
            },
            500: {
                description: 'Internal Server Error'
            }
        }
    });

}