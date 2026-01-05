import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const ChecklistItemResponseSchema = z.object({
    id: z.uuid().openapi({ description: 'Unique identifier for the checklist item' }),
    content: z.string().max(255).openapi({ description: 'Content of the checklist item' }),
    isCompleted: z.boolean().openapi({ description: 'Completion status of the checklist item' }),
    position: z.string().openapi({ description: 'Position of the checklist item in the checklist' }),
    checklistId: z.uuid().openapi({ description: 'Identifier of the associated checklist' }),
})
export type ChecklistItemResponse = z.infer<typeof ChecklistItemResponseSchema>;