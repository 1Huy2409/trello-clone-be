import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { CardResponseSchema } from "./schemas/card/card.response.schema";
import { CopyCardRequest, MoveCardRequest, MoveCardSchema, ReorderCardRequest, UpdateCardRequest } from "./schemas/card/card.request.schema";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilder";
import z from "zod";
import { CardMemberResponseSchema } from "./schemas/card-member/card-member.response.schema";
import { AssignMemberToCardRequest, RemoveMemberFromCardRequest } from "./schemas/card-member/card-member.request.schema";
import { ChecklistResponseSchema, CreateChecklistRequest } from "../checklist/schemas";

export const cardRegistry = new OpenAPIRegistry();
cardRegistry.register('Card', CardResponseSchema);

export function registerCardPaths() {
    cardRegistry.registerPath({
        method: 'get',
        path: '/api/v1/cards/{id}/members',
        tags: ['Card'],
        security: [{ bearerAuth: [] }],
        summary: 'Get members of a card',
        request: {
            params: z.object({
                id: z.uuid().openapi({ description: 'ID of the card', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
            })
        },
        responses: createApiResponse(z.array(CardMemberResponseSchema), 'Success')
    })
    cardRegistry.registerPath({
        method: 'post',
        path: '/api/v1/cards/{id}/members',
        tags: ['Card'],
        security: [{ bearerAuth: [] }],
        summary: 'Assign a member to a card',
        request: {
            body: AssignMemberToCardRequest,
            params: z.object({
                id: z.uuid().openapi({ description: 'ID of the card', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
            }),
        },
        responses: createApiResponse(CardMemberResponseSchema, 'Success')
    })
    cardRegistry.registerPath({
        method: 'post',
        path: '/api/v1/cards/{id}/checklists',
        tags: ['Checklist'],
        security: [{ bearerAuth: [] }],
        summary: 'Create a checklist for a card',
        request: {
            body: CreateChecklistRequest,
            params: z.object({
                id: z.uuid().openapi({ description: 'ID of the card', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
            }),
        },
        responses: createApiResponse(ChecklistResponseSchema, 'Success')
    })
    cardRegistry.registerPath({
        method: 'delete',
        path: '/api/v1/cards/{id}/members',
        tags: ['Card'],
        security: [{ bearerAuth: [] }],
        summary: 'Remove a member from a card',
        request: {
            body: RemoveMemberFromCardRequest,
            params: z.object({
                id: z.uuid().openapi({ description: 'ID of the card', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
            })
        },
        responses: createApiResponse(CardMemberResponseSchema, 'Success')
    })
    cardRegistry.registerPath({
        method: 'get',
        path: '/api/v1/lists/{listId}/cards',
        tags: ['Card'],
        security: [{ bearerAuth: [] }],
        summary: 'Get cards by list ID',
        request: {
            params: z.object({
                listId: z.uuid().openapi({ description: 'ID of the list', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
            })
        },
        responses: createApiResponse(z.array(CardResponseSchema), 'Success')
    })
    cardRegistry.registerPath({
        method: 'post',
        path: '/api/v1/lists/{listId}/cards',
        tags: ['Card'],
        security: [{ bearerAuth: [] }],
        summary: 'Create a new card in a list',
        request: {
            params: z.object({
                listId: z.uuid().openapi({ description: 'ID of the list', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
            }),
            body: UpdateCardRequest
        },
        responses: createApiResponse(CardResponseSchema, 'Success')
    })
    cardRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/cards/move',
        tags: ['Card'],
        security: [{ bearerAuth: [] }],
        summary: 'Move a card to another list',
        request: {
            body: MoveCardRequest
        },
        responses: createApiResponse(CardResponseSchema, 'Success')
    })
    cardRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/cards/reorder',
        tags: ['Card'],
        security: [{ bearerAuth: [] }],
        summary: 'Reorder a card within the same list',
        request: {
            body: ReorderCardRequest
        },
        responses: createApiResponse(CardResponseSchema, 'Success')
    })
    cardRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/cards/copy',
        tags: ['Card'],
        security: [{ bearerAuth: [] }],
        summary: 'Copy a card',
        request: {
            body: CopyCardRequest
        },
        responses: createApiResponse(CardResponseSchema, 'Success')
    })
    cardRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/cards/{id}/archive',
        tags: ['Card'],
        security: [{ bearerAuth: [] }],
        summary: 'Archive a card',
        request: {
            params: z.object({
                id: z.uuid().openapi({ description: 'ID of the card', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
            })
        },
        responses: createApiResponse(CardResponseSchema, 'Success')
    })
    cardRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/cards/{id}/reopen',
        tags: ['Card'],
        security: [{ bearerAuth: [] }],
        summary: 'Reopen an archived card',
        request: {
            params: z.object({
                id: z.uuid().openapi({ description: 'ID of the card', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
            })
        },
        responses: createApiResponse(CardResponseSchema, 'Success')
    })
    cardRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/cards/{id}',
        tags: ['Card'],
        security: [{ bearerAuth: [] }],
        summary: 'Update a card',
        request: {
            body: UpdateCardRequest,
            params: z.object({
                id: z.uuid().openapi({ description: 'ID of the card', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
            })
        },
        responses: createApiResponse(CardResponseSchema, 'Success')
    })
}   