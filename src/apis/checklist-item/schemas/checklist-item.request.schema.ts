import { z } from 'zod';
import { extendZodWithOpenApi, ZodRequestBody } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreateChecklistItemSchema = z.object({
    content: z.string().max(255).openapi({ description: 'Content of the checklist item' }),
})
export const CreateChecklistItemRequest: ZodRequestBody = {
    description: 'Request body for creating a checklist item',
    content: {
        'application/json': { schema: CreateChecklistItemSchema.openapi({ 
            description: 'Schema for creating a checklist item',
            example: { content: 'Buy groceries' }
         }) }
    }
}

export const UpdateContentChecklistItemSchema = z.object({
    content: z.string().max(255).optional().openapi({ description: 'Updated content of the checklist item' }),
})
export const UpdateContentChecklistItemRequest: ZodRequestBody = {
    description: 'Request body for updating checklist item content',
    content: {
        'application/json': { schema: UpdateContentChecklistItemSchema.openapi({ 
            description: 'Schema for updating checklist item content',
            example: { content: 'Buy groceries and cook dinner' }
         }) }
    }
}

export const UpdateStatusChecklistItemSchema = z.object({
    isCompleted: z.boolean().openapi({ description: 'Updated completion status of the checklist item' }),
})
export const UpdateStatusChecklistItemRequest: ZodRequestBody = {
    description: 'Request body for updating checklist item status',
    content: {
        'application/json': { schema: UpdateStatusChecklistItemSchema.openapi({
            description: 'Schema for updating checklist item status',
            example: { isCompleted: true }
         }) }
    }
}

export const ReorderChecklistItemSchema = z.object({
    beforeItemId: z.uuid().nullable().openapi({ description: 'ID of the checklist item that will be before the moved item after reordering. Null if moving to the start.' }),
    afterItemId: z.uuid().nullable().openapi({ description: 'ID of the checklist item that will be after the moved item after reordering. Null if moving to the end.' }),
})
export const ReorderChecklistItemRequest: ZodRequestBody = {
    description: 'Request body for reordering checklist items',
    content: {  
        'application/json': { schema: ReorderChecklistItemSchema.openapi({
            description: 'Schema for reordering checklist items',
            example: { beforeItemId: null, afterItemId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }
         }) }
    }
}

export type CreateChecklistItemSchema = z.infer<typeof CreateChecklistItemSchema>;
export type UpdateContentChecklistItemSchema = z.infer<typeof UpdateContentChecklistItemSchema>;
export type UpdateStatusChecklistItemSchema = z.infer<typeof UpdateStatusChecklistItemSchema>;
export type ReorderChecklistItemSchema = z.infer<typeof ReorderChecklistItemSchema>;