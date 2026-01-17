import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { BoardJoinLinkResponseSchema, BoardResponseSchema, ListBoardJoinLinkResponseSchema, ListBoardResponseSchema, PatchBoardRequest, PostBoardJoinLinkRequest, PostBoardWithWorkspaceRequest, PostInviteByEmailRequest, PostJoinBoardByLinkRequest } from "./schemas"
import { createApiResponse } from "@/api-docs/openAPIResponseBuilder"
import { ListResponseSchema, PostListRequest } from "../list/schemas"
import z from "zod"

export const boardRegistry = new OpenAPIRegistry()
boardRegistry.register('Board', BoardResponseSchema)
boardRegistry.register('BoardJoinLink', BoardJoinLinkResponseSchema)

export function registerBoardPaths() {
    boardRegistry.registerPath({
        method: 'get',
        path: '/api/v1/boards/public',
        tags: ['Board'],
        security: [{ bearerAuth: [] }],
        responses: createApiResponse(ListBoardResponseSchema, 'Success')
    })
    boardRegistry.registerPath({
        method: 'get',
        path: '/api/v1/boards/public/{id}',
        tags: ['Board'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Board UUID',
                    format: 'uuid'
                })
            })
        },
        responses: createApiResponse(ListBoardResponseSchema, 'Success')
    })
    boardRegistry.registerPath({
        method: 'get',
        path: '/api/v1/boards/{id}/invite/links',
        tags: ['Invite'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Board UUID',
                    format: 'uuid'
                })
            })
        },
        responses: createApiResponse(ListBoardJoinLinkResponseSchema, 'Success')
    })
    boardRegistry.registerPath({
        method: 'get',
        path: '/api/v1/boards/{boardId}/lists/archived',
        tags: ['List'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                boardId: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Board UUID',
                    format: 'uuid'
                })
            })
        },
        responses: createApiResponse(z.array(ListResponseSchema), 'Success')
    })
    boardRegistry.registerPath({
        method: 'get',
        path: '/api/v1/boards/{boardId}/lists',
        tags: ['List'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                boardId: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Board UUID',
                    format: 'uuid'
                })
            })
        },
        responses: createApiResponse(z.array(ListResponseSchema), 'Success')
    })
    boardRegistry.registerPath({
        method: 'get',
        path: '/api/v1/boards/{id}/members',
        tags: ['Board'],
        summary: 'Get all members of a board',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Board UUID',
                    format: 'uuid'
                })
            })
        },
        responses: {
            200: {
                description: 'Board members retrieved successfully',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(z.object({
                                id: z.string(),
                                userId: z.string(),
                                username: z.string().optional(),
                                fullname: z.string().optional(),
                                email: z.string().optional(),
                                avatarUrl: z.string().optional().nullable(),
                                roleId: z.string(),
                                roleName: z.string().optional(),
                                joinedAt: z.date()
                            }))
                        })
                    }
                }
            }
        }
    })
    boardRegistry.registerPath({
        method: 'post',
        path: '/api/v1/boards',
        tags: ['Board'],
        security: [{ bearerAuth: [] }],
        request: {
            body: PostBoardWithWorkspaceRequest
        },
        responses: createApiResponse(BoardResponseSchema, 'Success')
    })
    boardRegistry.registerPath({
        method: 'post',
        path: '/api/v1/boards/{boardId}/lists',
        tags: ['Board'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                boardId: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Board UUID',
                    format: 'uuid'
                })
            }),
            body: PostListRequest
        },
        responses: createApiResponse(ListResponseSchema, 'Success')
    })
    boardRegistry.registerPath({
        method: 'post',
        path: '/api/v1/boards/{id}/invite/link',
        tags: ['Invite'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Board UUID',
                    format: 'uuid'
                })
            }),
            body: PostBoardJoinLinkRequest
        },
        responses: createApiResponse(BoardJoinLinkResponseSchema, 'Success')
    })
    boardRegistry.registerPath({
        method: 'post',
        path: '/api/v1/boards/join',
        tags: ['Invite'],
        security: [{ bearerAuth: [] }],
        request: {
            body: PostJoinBoardByLinkRequest
        },
        responses: createApiResponse(z.object({ message: z.string() }), 'Success')
    })
    boardRegistry.registerPath({
        method: 'post',
        path: '/api/v1/boards/{id}/invite/email',
        tags: ['Invite'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Board UUID',
                    format: 'uuid'
                })
            }),
            body: PostInviteByEmailRequest
        },
        responses: createApiResponse(z.object({ message: z.string() }), 'Success')
    })
    boardRegistry.registerPath({
        method: 'post',
        path: '/api/v1/boards/{id}/reopen',
        tags: ['Board'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.uuid() })
        },
        responses: createApiResponse(z.null(), 'Success')
    })
    const ChangeOwnerBody = z.object({ ownerId: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }) });
    const PostChangeOwnerRequest = {
        description: 'Change board owner',
        content: {
            'application/json': {
                schema: ChangeOwnerBody.openapi({ example: { ownerId: '123e4567-e89b-12d3-a456-426614174000' } })
            }
        }
    };
    boardRegistry.registerPath({
        method: 'post',
        path: '/api/v1/boards/{id}/change-owner',
        tags: ['Board'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.uuid() }),
            body: PostChangeOwnerRequest
        },
        responses: createApiResponse(BoardResponseSchema, 'Success')
    })
    boardRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/boards/{boardId}',
        tags: ['Board'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                boardId: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Board UUID',
                    format: 'uuid'
                })
            }),
            body: PatchBoardRequest
        },
        responses: createApiResponse(BoardResponseSchema, 'Success')
    })
    boardRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/boards/{id}/invite/link/{linkId}/revoke',
        tags: ['Invite'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Board UUID',
                    format: 'uuid'
                }),
                linkId: z.uuid().openapi({
                    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
                    description: 'Join Link UUID',
                    format: 'uuid'
                })
            })
        },
        responses: createApiResponse(z.object({ message: z.string() }), 'Success')
    })
    boardRegistry.registerPath({
        method: 'delete',
        path: '/api/v1/boards/{boardId}',
        tags: ['Board'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                boardId: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Board UUID',
                    format: 'uuid'
                })
            })
        },
        responses: createApiResponse(z.null(), 'Success')
    })
    boardRegistry.registerPath({
        method: 'delete',
        path: '/api/v1/boards/{id}/invite/link/{linkId}',
        tags: ['Invite'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Board UUID',
                    format: 'uuid'
                }),
                linkId: z.uuid().openapi({
                    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
                    description: 'Join Link UUID',
                    format: 'uuid'
                })
            })
        },
        responses: createApiResponse(z.object({ message: z.string() }), 'Success')
    })
    boardRegistry.registerPath({
        method: 'delete',
        path: '/api/v1/boards/{id}/permanent',
        tags: ['Board'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.uuid() })
        },
        responses: createApiResponse(z.null(), 'Success')
    })
}