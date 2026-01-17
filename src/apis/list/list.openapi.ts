import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { CopyListRequest, ListResponseSchema, MoveListRequest, PatchListRequest, ReorderListRequest } from "./schemas";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilder";
import z from "zod";
import { CardResponseSchema } from "../card/schemas/card/card.response.schema";

export const listRegistry = new OpenAPIRegistry();
listRegistry.register('List', ListResponseSchema);
export function registerListPaths() {
    listRegistry.registerPath({
        method: 'get',
        path: '/api/v1/lists/{listId}/cards/archived',
        tags: ['Card'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                listId: z.uuid().openapi({ description: 'ID of the list', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
            })
        },
        responses: createApiResponse(CardResponseSchema, 'Success')
    })
    listRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/lists/reorder',
        tags: ['List'],
        security: [{ bearerAuth: [] }],
        request: {
            body: ReorderListRequest
        },
        responses: createApiResponse(ListResponseSchema, 'Success')
    })
    listRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/lists/move',
        tags: ['List'],
        security: [{ bearerAuth: [] }],
        request: {
            body: MoveListRequest
        },
        responses: createApiResponse(ListResponseSchema, 'Success')
    })
    listRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/lists/copy',
        tags: ['List'],
        security: [{ bearerAuth: [] }],
        request: {
            body: CopyListRequest
        },
        responses: createApiResponse(ListResponseSchema, 'Success')
    })
    listRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/lists/{listId}/name',
        tags: ['List'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                listId: z.uuid().openapi({ description: 'ID of the list', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
            }),
            body: PatchListRequest
        },
        responses: createApiResponse(ListResponseSchema, 'Success')
    })
    listRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/lists/{listId}/archive',
        tags: ['List'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                listId: z.uuid().openapi({ description: 'ID of the list', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
            }),
        },
        responses: createApiResponse(ListResponseSchema, 'Success')
    })
    listRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/lists/{listId}/reopen',
        tags: ['List'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                listId: z.uuid().openapi({ description: 'ID of the list', example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6' })
            }),
        },
        responses: createApiResponse(ListResponseSchema, 'Success')
    })
}