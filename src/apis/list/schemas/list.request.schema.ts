import { z } from 'zod';
import { extendZodWithOpenApi, ZodRequestBody } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);
export const CreateListSchema = z.object({
    title: z.string().min(1).max(255).openapi({ description: 'Title of the list', example: 'To Do' }),
})
export const PostListRequest: ZodRequestBody = {
    description: 'Create new list',
    content: {
        'application/json': {
            schema: CreateListSchema.openapi({ example: { title: 'To Do' } })
        }
    }
}
// edit list name schema
export const UpdateListSchema = z.object({
    title: z.string().min(1).max(255).optional().openapi({ description: 'Title of the list', example: 'To Do' }),
})
export const PatchListRequest: ZodRequestBody = {
    description: 'Update list',
    content: {
        'application/json': {
            schema: UpdateListSchema.openapi({ example: { title: 'To Do' } })
        }
    }
}
// reorder list schema
export const ReorderListSchema = z.object({
    listId: z.uuid().openapi({ description: 'ID of the list to reorder', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' }),
    beforeListId: z.uuid().nullable().openapi({ description: 'ID of the list before which the list will be placed. If null, the list will be moved to the end.', example: 'z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4' }),
    afterListId: z.uuid().nullable().openapi({ description: 'ID of the list after which the list will be placed. If null, the list will be moved to the start.', example: 'b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6' }),
})
export const ReorderListRequest: ZodRequestBody = {
    description: 'Reorder list',
    content: {
        'application/json': {
            schema: ReorderListSchema.openapi({
                example: {
                    listId: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    beforeListId: 'z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4',
                    afterListId: 'b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6'
                }
            })
        }
    }
}
// move list schema 
export const MoveListSchema = z.object({
    listId: z.uuid().openapi({ description: 'ID of the list to move', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' }),
    targetBoardId: z.uuid().openapi({ description: 'ID of the target board to move the list to', example: 'z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4' }),
    beforeListId: z.uuid().nullable().openapi({ description: 'ID of the list before which the list will be placed in the target board. If null, the list will be moved to the end.', example: 'b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6' }),
    afterListId: z.uuid().nullable().openapi({ description: 'ID of the list after which the list will be placed in the target board. If null, the list will be moved to the start.', example: 'm1n2o3p4-q5r6-s7t8-u9v0-w1x2y3z4a5b6' }),
})
export const MoveListRequest: ZodRequestBody = {
    description: 'Move list to another board',
    content: {
        'application/json': {
            schema: MoveListSchema.openapi({
                example: {
                    listId: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                    targetBoardId: 'z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4',
                    beforeListId: 'b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6',
                    afterListId: 'm1n2o3p4-q5r6-s7t8-u9v0-w1x2y3z4a5b6'
                }
            })
        }
    }
}
// copy list schema
export const CopyListSchema = z.object({
    listId: z.uuid().openapi({ description: 'ID of the list to copy', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' }),
    targetBoardId: z.uuid().optional().openapi({ description: 'ID of the target board to copy the list to. If not provided, the list will be copied to the same board.', example: 'z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4' }),
    title: z.string().min(1).max(255).optional().openapi({ description: 'Title of the new copied list', example: 'To Do Copy' }),
})
export const CopyListRequest: ZodRequestBody = {
    description: 'Copy list',
    content: {
        'application/json': {
            schema: CopyListSchema.openapi({ example: { listId: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', targetBoardId: 'z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4', title: 'To Do Copy' } })
        }
    }
}

export type CreateListSchema = z.infer<typeof CreateListSchema>;
export type UpdateListSchema = z.infer<typeof UpdateListSchema>;
export type ReorderListSchema = z.infer<typeof ReorderListSchema>;
export type MoveListSchema = z.infer<typeof MoveListSchema>;
export type CopyListSchema = z.infer<typeof CopyListSchema>;