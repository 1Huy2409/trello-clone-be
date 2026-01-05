import { z } from 'zod';
import { extendZodWithOpenApi, ZodRequestBody } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreateChecklistSchema = z.object({
    name: z.string().min(1).max(255).openapi({ description: 'Name of the checklist' }),
})

export const CreateChecklistRequest: ZodRequestBody = {
    description: 'Create Checklist Request',
    content: {
        'application/json': {
            schema: CreateChecklistSchema.openapi({
                description: 'Create Checklist Schema',
                example: { name: 'My Checklist' }
            }),
        }
    }
}
export const UpdateChecklistSchema = z.object({
    name: z.string().min(1).max(255).openapi({ description: 'Updated name of the checklist' })
})
export const UpdateChecklistRequest: ZodRequestBody = {
    description: 'Update Checklist Request',
    content: {
        'application/json': {
            schema: UpdateChecklistSchema.openapi({
                description: 'Update Checklist Schema',
                example: { name: 'Updated Checklist Name' }
            }),
        }
    }
}

export const ReorderChecklistSchema = z.object({
    beforeChecklistId: z.string().nullable().openapi({ description: 'ID of the checklist that will be before the moved checklist after reordering' }),
    afterChecklistId: z.string().nullable().openapi({ description: 'ID of the checklist that will be after the moved checklist after reordering' }),
})
export const ReorderChecklistRequest: ZodRequestBody = {
    description: 'Reorder Checklist Request',
    content: {
        'application/json': {
            schema: ReorderChecklistSchema.openapi({
                description: 'Reorder Checklist Schema',
                example: { beforeChecklistId: 'checklistId1', afterChecklistId: 'checklistId3' }
            }),
        }
    }
}

export type CreateChecklistSchema = z.infer<typeof CreateChecklistSchema>;
export type UpdateChecklistSchema = z.infer<typeof UpdateChecklistSchema>;
export type ReorderChecklistSchema = z.infer<typeof ReorderChecklistSchema>;

export const CopyChecklistSchema = z.object({
    cardId: z.uuid().openapi({ description: 'ID of the target card to copy the checklist to' }),
    name: z.string().min(1).max(255).optional().openapi({ description: 'Optional new name for the copied checklist' }),
})
export const CopyChecklistRequest: ZodRequestBody = {
    description: 'Copy Checklist Request',
    content: {
        'application/json': {
            schema: CopyChecklistSchema.openapi({
                description: 'Copy Checklist Schema',
                example: { cardId: 'targetCardId', name: 'Copied Checklist' }
            }),
        }
    }
}
export type CopyChecklistSchema = z.infer<typeof CopyChecklistSchema>;