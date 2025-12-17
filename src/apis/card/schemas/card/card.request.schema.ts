import { z } from 'zod';
import { extendZodWithOpenApi, ZodRequestBody } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreateCardSchema = z.object({
    title: z.string().min(1).max(255).openapi({ description: 'Title of the card', example: 'Implement authentication' }),
    description: z.string().optional().openapi({ description: 'Description of the card', example: 'Implement user authentication using JWT' }),
    coverUrl: z.url().optional().openapi({ description: 'Cover image URL of the card', example: 'https://example.com/cover.jpg' }),
    priority: z.enum(['low', 'medium', 'high']).optional().openapi({ description: 'Priority of the card', example: 'medium' }),
    dueDate: z.string().optional().openapi({ description: 'Due date of the card in YYYY-MM-DD format', example: '2024-12-31' }),
})
export const CreateCardRequest: ZodRequestBody = {
    description: 'Create new card',
    content: {
        'application/json': {
            schema: CreateCardSchema.openapi({
                example: {
                    title: 'Implement authentication',
                    description: 'Implement user authentication using JWT',
                    coverUrl: 'https://example.com/cover.jpg',
                    priority: 'medium',
                    dueDate: '2024-12-31'
                }
            })
        }
    }
}

export const UpdateCardSchema = z.object({
    title: z.string().min(1).max(255).optional().openapi({ description: 'Title of the card', example: 'Implement authentication' }),
    description: z.string().optional().openapi({ description: 'Description of the card', example: 'Implement user authentication using JWT' }),
    coverUrl: z.url().optional().openapi({ description: 'Cover image URL of the card', example: 'https://example.com/cover.jpg' }),
    priority: z.enum(['low', 'medium', 'high']).optional().openapi({ description: 'Priority of the card', example: 'medium' }),
    dueDate: z.string().optional().openapi({ description: 'Due date of the card in YYYY-MM-DD format', example: '2024-12-31' }),
})
export const UpdateCardRequest: ZodRequestBody = {
    description: 'Update card',
    content: {
        'application/json': {
            schema: UpdateCardSchema.openapi({
                example: {
                    title: 'Implement authentication',
                    description: 'Implement user authentication using JWT',
                    coverUrl: 'https://example.com/cover.jpg',
                    priority: 'medium',
                    dueDate: '2024-12-31'
                }
            })
        }
    }
}

export const MoveCardSchema = z.object({
    cardId: z.uuid().openapi({ description: 'ID of the card to move', example: 'c1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' }),
    targetBoardId: z.uuid().openapi({ description: 'ID of the board', example: 'b1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' }),
    targetListId: z.uuid().openapi({ description: 'ID of the target list', example: 'l1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' }),
    beforeCardId: z.uuid().nullable().openapi({ description: 'ID of the card to place before', example: 'c1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' }),
    afterCardId: z.uuid().nullable().openapi({ description: 'ID of the card to place after', example: 'c6p5o4n3-m2l1-k0j9-i8h7-g6f5e4d3c2b1' }),
})
export const MoveCardRequest: ZodRequestBody = {
    description: 'Move card to another list or reorder within the same list',
    content: {
        'application/json': {
            schema: MoveCardSchema.openapi({
                example: {
                    cardId: 'c1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    targetBoardId: 'b1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    targetListId: 'l1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    beforeCardId: 'c1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    afterCardId: null
                }
            })
        }
    }
}

export const CopyCardSchema = z.object({
    title: z.string().min(1).max(255).optional().openapi({ description: 'Title of the copied card', example: 'Implement authentication - Copy' }),
    ...MoveCardSchema.shape,
})
export const CopyCardRequest: ZodRequestBody = {
    description: 'Copy card to another list',
    content: {
        'application/json': {
            schema: CopyCardSchema.openapi({
                example: {
                    cardId: 'c1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    title: 'Implement authentication - Copy',
                    targetBoardId: 'b1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    targetListId: 'l1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    beforeCardId: 'c1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    afterCardId: null
                }
            })
        }
    }
}

export const ReorderCardSchema = z.object({
    cardId: z.uuid().openapi({ description: 'ID of the card to reorder', example: 'c1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' }),
    targetListId: z.uuid().openapi({ description: 'ID of the target list', example: 'l1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' }),
    beforeCardId: z.uuid().nullable().openapi({ description: 'ID of the card to place before', example: 'c1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' }),
    afterCardId: z.uuid().nullable().openapi({ description: 'ID of the card to place after', example: 'c6p5o4n3-m2l1-k0j9-i8h7-g6f5e4d3c2b1' }),
})
export const ReorderCardRequest: ZodRequestBody = {
    description: 'Reorder card within the same list',
    content: {
        'application/json': {
            schema: ReorderCardSchema.openapi({
                example: {
                    cardId: 'c1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    targetListId: 'l1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    beforeCardId: 'c1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    afterCardId: null
                }
            })
        }
    }
}

export type CreateCardSchema = z.infer<typeof CreateCardSchema>;
export type UpdateCardSchema = z.infer<typeof UpdateCardSchema>;
export type MoveCardSchema = z.infer<typeof MoveCardSchema>;
export type CopyCardSchema = z.infer<typeof CopyCardSchema>;
export type ReorderCardSchema = z.infer<typeof ReorderCardSchema>;
