import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { JoinLinkResponseSchema, PostJoinLinkRequest, PostJoinWorkspaceByLinkRequest } from "./schemas/join-link.schema";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilder";

export const joinLinkRegistry = new OpenAPIRegistry();
joinLinkRegistry.register('Create Join Link', z.null());

export function registerJoinLinkPaths() {
    joinLinkRegistry.registerPath(
        {
            method: 'get',
            path: '/api/v1/workspaces/{id}/join-links',
            tags: ['Join Link'],
            security: [{ bearerAuth: [] }],
            request: {
                params: z.object({
                    id: z.uuid().openapi({
                        example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                        description: 'Workspace UUID',
                        format: 'uuid'
                    })
                })
            },
            responses: createApiResponse(z.array(JoinLinkResponseSchema), 'Success')
        }
    )
    joinLinkRegistry.registerPath(
        {
            method: 'post',
            path: '/api/v1/workspaces/{id}/join-links',
            tags: ['Join Link'],
            security: [{ bearerAuth: [] }],
            request: {
                params: z.object({
                    id: z.uuid().openapi({
                        example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                        description: 'Workspace UUID',
                        format: 'uuid'
                    })
                }),
                body: PostJoinLinkRequest
            },
            responses: createApiResponse(JoinLinkResponseSchema, 'Success')
        }
    )
    joinLinkRegistry.registerPath(
        {
            method: 'post',
            path: '/api/v1/workspaces/join-by-link',
            tags: ['Join Link'],
            security: [{ bearerAuth: [] }],
            request: {
                body: PostJoinWorkspaceByLinkRequest
            },
            responses: createApiResponse(JoinLinkResponseSchema, 'Success')
        }
    )
    joinLinkRegistry.registerPath(
        {
            method: 'patch',
            path: '/api/v1/workspaces/{workspaceId}/join-links/{linkId}/revoke',
            tags: ['Join Link'],
            security: [{ bearerAuth: [] }],
            request: {
                params: z.object({
                    workspaceId: z.uuid().openapi({
                        example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                        description: 'Workspace UUID',
                        format: 'uuid'
                    }),
                    linkId: z.uuid().openapi({
                        example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
                        description: 'Join Link UUID',
                        format: 'uuid'
                    })
                })
            },
            responses: createApiResponse(JoinLinkResponseSchema, 'Success')
        }
    )
    joinLinkRegistry.registerPath(
        {
            method: 'delete',
            path: '/api/v1/workspaces/{workspaceId}/join-links/{linkId}',
            tags: ['Join Link'],
            security: [{ bearerAuth: [] }],
            request: {
                params: z.object({
                    workspaceId: z.uuid().openapi({
                        example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                        description: 'Workspace UUID',
                        format: 'uuid'
                    }),
                    linkId: z.uuid().openapi({
                        example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
                        description: 'Join Link UUID',
                        format: 'uuid'
                    })
                })
            },
            responses: createApiResponse(JoinLinkResponseSchema, 'Success')
        }
    )
}