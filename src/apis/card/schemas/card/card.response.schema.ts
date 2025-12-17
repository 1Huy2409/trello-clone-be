import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ListCardMembersResponseSchema } from '../card-member/card-member.response.schema';
extendZodWithOpenApi(z);

export const CardResponseSchema = z.object({
    id: z.uuid().openapi({ description: 'The unique identifier of the card' }),
    title: z.string().openapi({ description: 'The title of the card' }),
    description: z.string().nullable().openapi({ description: 'The description of the card' }),
    cardMembers: ListCardMembersResponseSchema.optional().openapi({ description: 'The members associated with the card' }),
    position: z.string().openapi({ description: 'The position of the card in the list' }),
    coverUrl: z.string().nullable().openapi({ description: 'The cover URL of the card' }),
    priority: z.enum(['low', 'medium', 'high']).openapi({ description: 'The priority level of the card' }),
    dueDate: z.string().nullable().openapi({ description: 'The due date of the card' }),
    boardId: z.uuid().openapi({ description: 'The unique identifier of the board' }),
    listId: z.uuid().openapi({ description: 'The unique identifier of the list' }),
})

export type CardResponse = z.infer<typeof CardResponseSchema>;