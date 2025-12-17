import { z } from 'zod';
import { extendZodWithOpenApi, ZodRequestBody } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const AssignMemberToCardSchema = z.object({
    userId: z.uuid().openapi({ description: 'ID of the user to assign to the card', example: 'u1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' }),
})
export const AssignMemberToCardRequest: ZodRequestBody = {
    description: 'Assign a member to a card',
    content: {
        'application/json': {
            schema: AssignMemberToCardSchema.openapi({
                example: {
                    userId: 'u1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6'
                }
            })
        }
    }
}

export const RemoveMemberFromCardSchema = z.object({
    userId: z.uuid().openapi({ description: 'ID of the user to remove from the card', example: 'u1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' }),
})
export const RemoveMemberFromCardRequest: ZodRequestBody = {
    description: 'Remove a member from a card',
    content: {
        'application/json': {
            schema: RemoveMemberFromCardSchema.openapi({
                example: {
                    userId: 'u1a2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6'
                }
            })
        }
    }
}

export type AssignMemberToCardSchema = z.infer<typeof AssignMemberToCardSchema>;
export type RemoveMemberFromCardSchema = z.infer<typeof RemoveMemberFromCardSchema>;