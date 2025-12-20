import { ZodRequestBody } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

export const CreateBoardJoinLinkSchema = z.object({
    expiresIn: z.number().min(1).max(365).nullable().optional().openapi({
        description: 'Number of days until the link expires. Leave empty or null for permanent link.',
        example: 7
    }),
    maxUses: z.number().min(1).nullable().optional().openapi({
        description: 'Maximum number of times the link can be used. Leave empty or null for unlimited uses.',
        example: 10
    }),
});

export const PostBoardJoinLinkRequest: ZodRequestBody = {
    description: 'Create a join link for a board',
    content: {
        'application/json': {
            schema: CreateBoardJoinLinkSchema.openapi({
                example: { expiresIn: 7, maxUses: 10 }
            })
        }
    }
}

export const JoinBoardByLinkSchema = z.object({
    token: z.string().min(1).openapi({
        description: 'Join link token',
        example: 'abc123token'
    })
})

export const PostJoinBoardByLinkRequest: ZodRequestBody = {
    description: 'Join a board using a join link token',
    content: {
        'application/json': {
            schema: JoinBoardByLinkSchema.openapi({
                example: { token: 'abc123token' }
            })
        }
    }
}

export const InviteByEmailSchema = z.object({
    email: z.email().openapi({
        description: 'Email address to send invitation',
        example: 'user@example.com'
    }),
    roleId: z.uuid().optional().openapi({
        description: 'Role ID to assign to the invited member. If not provided, defaults to board_member role.',
        example: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
    })
});

export const PostInviteByEmailRequest: ZodRequestBody = {
    description: 'Invite a user to the board via email',
    content: {
        'application/json': {
            schema: InviteByEmailSchema.openapi({
                example: {
                    email: 'user@example.com',
                    roleId: 'd290f1ee-6c54-4b01-90e6-d701748f0851'
                }
            })
        }
    }
}

export type CreateBoardJoinLinkDto = z.infer<typeof CreateBoardJoinLinkSchema>;
export type JoinBoardByLinkDto = z.infer<typeof JoinBoardByLinkSchema>;
export type InviteByEmailDto = z.infer<typeof InviteByEmailSchema>;

export const BoardJoinLinkResponseSchema = z.object({
    id: z.uuid().openapi({
        example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
        description: 'Join Link UUID',
        format: 'uuid'
    }),
    token: z.string().openapi({
        example: 'abc123token',
        description: 'Join Link Token'
    }),
    fullLink: z.url().openapi({
        example: 'https://yourapp.com/board/join/abc123token',
        description: 'Full Join Link URL'
    }),
    expiresAt: z.date().nullable().openapi({
        example: '2024-12-31T23:59:59.000Z',
        description: 'Expiration date of the join link. Null means permanent link.'
    }),
    maxUses: z.number().nullable().openapi({
        example: 10,
        description: 'Maximum number of uses for the join link. Null means unlimited.'
    }),
    usedCount: z.number().openapi({
        example: 3,
        description: 'Number of times the link has been used'
    }),
    isActive: z.boolean().openapi({
        example: true,
        description: 'Indicates if the join link is active'
    }),
    createdAt: z.date().openapi({
        example: '2024-01-01T12:00:00.000Z',
        description: 'Creation date of the join link'
    })
});

export const ListBoardJoinLinkResponseSchema = z.array(BoardJoinLinkResponseSchema);

export interface BoardJoinLinkResponse {
    id: string;
    token: string;
    fullLink: string;
    expiresAt: Date | null;
    maxUses: number | null;
    usedCount: number;
    isActive: boolean;
    createdAt: Date;
}
