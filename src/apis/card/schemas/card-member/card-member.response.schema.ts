import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CardMemberResponseSchema = z.object({
    id: z.uuid().openapi({ description: 'The unique identifier of the card member' }),
    userId: z.uuid().openapi({ description: 'The unique identifier of the user' }),
    fullname: z.string().openapi({ description: 'The full name of the user' }),
    avatarUrl: z.string().nullable().openapi({ description: 'The avatar URL of the user' }),
    cardId: z.uuid().openapi({ description: 'The unique identifier of the card' }),
})
export const ListCardMembersResponseSchema = z.array(CardMemberResponseSchema).openapi({ description: 'List of card members' });

export type CardMemberResponse = z.infer<typeof CardMemberResponseSchema>;
export type ListCardMembersResponse = z.infer<typeof ListCardMembersResponseSchema>;