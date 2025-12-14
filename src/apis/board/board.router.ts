import { z } from "zod";
import { Router } from "express";
import BoardController from "./board.controller";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
    BoardResponseSchema,
    ListBoardResponseSchema,
    PostBoardWithWorkspaceRequest,
    PatchBoardRequest,
    PostBoardJoinLinkRequest,
    BoardJoinLinkResponseSchema,
    ListBoardJoinLinkResponseSchema,
    PostJoinBoardByLinkRequest,
    PostInviteByEmailRequest
} from "./schemas";
import { ListResponseSchema } from "../list/schemas/list.response.schema";
import { createApiResponse } from '@/api-docs/openAPIResponseBuilder';
import { checkAuthentication } from "@/common/middleware/authentication";
import { checkBoardPermission, checkWorkspacePermission } from "@/common/middleware/authorization";
import { PERMISSIONS } from "@/common/constants/permissions";
import { CopyListRequest, MoveListRequest, PostListRequest, ReorderListRequest } from "../list/schemas/list.request.schema";

export const boardRegistry = new OpenAPIRegistry()
boardRegistry.register('Board', BoardResponseSchema)
boardRegistry.register('BoardJoinLink', BoardJoinLinkResponseSchema)
export default function boardRouter(boardController: BoardController): Router {
    const router: Router = Router()

    boardRegistry.registerPath({
        method: 'get',
        path: '/api/v1/boards/public',
        tags: ['Board'],
        security: [{ bearerAuth: [] }],
        responses: createApiResponse(ListBoardResponseSchema, 'Success')
    })
    router.get('/public', asyncHandler(boardController.getAllPublicBoards))

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
    router.post('/',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.BOARD_CREATE)),
        asyncHandler(boardController.createBoard))

    // Begin manage lists - must be defined before /:id routes to avoid param conflicts
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
    router.post('/:boardId/lists',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.LIST_CREATE)),
        asyncHandler(boardController.createList))

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
    router.get('/public/:id', asyncHandler(boardController.getPublicBoardById))

    boardRegistry.registerPath({
        method: 'delete',
        path: '/api/v1/boards/{id}',
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
        responses: createApiResponse(z.null(), 'Success')
    })
    router.delete('/:id',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_DELETE)),
        asyncHandler(boardController.deleteBoard))

    boardRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/boards/{id}',
        tags: ['Board'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Board UUID',
                    format: 'uuid'
                })
            }),
            body: PatchBoardRequest
        },
        responses: createApiResponse(BoardResponseSchema, 'Success')
    })
    router.patch('/:id',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_UPDATE)),
        asyncHandler(boardController.updateBoard))

    // Board invite routes
    boardRegistry.registerPath({
        method: 'post',
        path: '/api/v1/boards/{id}/invite/link',
        tags: ['Board', 'Invite'],
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
    router.post('/:id/invite/link',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_MANAGE_MEMBERS)),
        asyncHandler(boardController.createBoardJoinLink))

    boardRegistry.registerPath({
        method: 'post',
        path: '/api/v1/boards/join',
        tags: ['Board', 'Invite'],
        security: [{ bearerAuth: [] }],
        request: {
            body: PostJoinBoardByLinkRequest
        },
        responses: createApiResponse(z.object({ message: z.string() }), 'Success')
    })
    router.post('/join',
        asyncHandler(checkAuthentication),
        asyncHandler(boardController.joinBoardByLink))

    boardRegistry.registerPath({
        method: 'get',
        path: '/api/v1/boards/{id}/invite/links',
        tags: ['Board', 'Invite'],
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
    router.get('/:id/invite/links',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_VIEW_MEMBERS)),
        asyncHandler(boardController.getBoardJoinLinks))

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
    router.get('/:boardId/lists',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.LIST_VIEW)),
        asyncHandler(boardController.getListsByBoardId))
    // Get board members
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

    router.get('/:id/members',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_VIEW)),
        asyncHandler(boardController.getBoardMembers))

    boardRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/boards/{id}/invite/link/{linkId}/revoke',
        tags: ['Board', 'Invite'],
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
    router.patch('/:id/invite/link/:linkId/revoke',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_MANAGE_MEMBERS)),
        asyncHandler(boardController.revokeBoardJoinLink))

    boardRegistry.registerPath({
        method: 'delete',
        path: '/api/v1/boards/{id}/invite/link/{linkId}',
        tags: ['Board', 'Invite'],
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
    router.delete('/:id/invite/link/:linkId',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_MANAGE_MEMBERS)),
        asyncHandler(boardController.deleteBoardJoinLink))

    boardRegistry.registerPath({
        method: 'post',
        path: '/api/v1/boards/{id}/invite/email',
        tags: ['Board', 'Invite'],
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
    router.post('/:id/invite/email',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_MANAGE_MEMBERS)),
        asyncHandler(boardController.inviteByEmail))

    // reopen archived board
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
    router.post('/:id/reopen',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_UPDATE)),
        asyncHandler(boardController.reopenBoard))

    // permanent delete
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
    router.delete('/:id/permanent',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_DELETE)),
        asyncHandler(boardController.deletePermanent))

    // change owner
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
    router.post('/:id/change-owner',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_UPDATE)),
        asyncHandler(boardController.changeOwner))

    return router;
}
