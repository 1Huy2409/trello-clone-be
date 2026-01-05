import { z } from 'zod';
import { extendZodWithOpenApi, ZodRequestBody } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const ChecklistResponseSchema = z.object({
    id: z.uuid().openapi({ description: 'Unique identifier for the checklist' }),
    name: z.string().openapi({ description: 'Name of the checklist' }),
    cardId: z.uuid().openapi({ description: 'Identifier of the card this checklist belongs to' }),
    position: z.number().openapi({ description: 'Position of the checklist within the card' }),
})

export type ChecklistResponse = z.infer<typeof ChecklistResponseSchema>;