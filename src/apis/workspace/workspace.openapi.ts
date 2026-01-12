import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { ListWorkspaceResponseSchema, ListWorkspaceRoleResponseSchema, PatchWorkspaceMemberRoleRequest, PatchWorkspaceRequest, PatchWorkspaceRoleRequest, PostWorkspaceRequest, PostWorkspaceRoleRequest, WorkspaceMemberResponseSchema, WorkspaceResponseSchema, WorkspaceRoleResponseSchema } from "./schemas";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilder";
import z from "zod";
import { BoardResponseSchema, ListBoardResponseSchema, PatchBoardRequest, PostBoardRequest } from "../board/schemas";

export const workspaceRegistry = new OpenAPIRegistry()
workspaceRegistry.register('Workspace', WorkspaceResponseSchema)

export function registerWorkspacePaths() {
    workspaceRegistry.registerPath({
        method: 'get',
        path: '/api/v1/workspaces',
        tags: ['Workspace'],
        security: [{ bearerAuth: [] }],
        responses: createApiResponse(ListWorkspaceResponseSchema, 'Success')
    });
    workspaceRegistry.registerPath({
        method: 'get',
        path: '/api/v1/workspaces/archived',
        tags: ['Workspace'],
        security: [{ bearerAuth: [] }],
        responses: createApiResponse(ListWorkspaceResponseSchema, 'Success')
    });
    workspaceRegistry.registerPath({
        method: 'get',
        path: '/api/v1/workspaces/{id}',
        tags: ['Workspace'],
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
        responses: createApiResponse(ListWorkspaceResponseSchema, 'Success')
    })
    workspaceRegistry.registerPath({
        method: 'get',
        path: '/api/v1/workspaces/{id}/members',
        tags: ['Workspace'],
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
        responses: createApiResponse(ListWorkspaceResponseSchema, 'Success')
    })
    workspaceRegistry.registerPath({
        method: 'get',
        path: '/api/v1/workspaces/{id}/boards',
        tags: ['Board'],
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
        responses: createApiResponse(ListBoardResponseSchema, 'Success')
    })
    workspaceRegistry.registerPath({
        method: 'get',
        path: '/api/v1/workspaces/{id}/roles',
        tags: ['Workspace'],
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
        responses: createApiResponse(ListWorkspaceRoleResponseSchema, 'Success')
    })
    workspaceRegistry.registerPath({
        method: 'post',
        path: '/api/v1/workspaces',
        tags: ['Workspace'],
        security: [{ bearerAuth: [] }],
        request: { body: PostWorkspaceRequest },
        responses: createApiResponse(WorkspaceResponseSchema, 'Success'),
    })
    workspaceRegistry.registerPath({
        method: 'post',
        path: '/api/v1/workspaces/{id}/boards',
        tags: ['Board'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Workspace UUID',
                    format: 'uuid'
                })
            }),
            body: PostBoardRequest
        },
        responses: createApiResponse(BoardResponseSchema, 'Success')
    })
    workspaceRegistry.registerPath({
        method: 'post',
        path: '/api/v1/workspaces/{id}/roles',
        tags: ['Workspace'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Workspace UUID',
                    format: 'uuid'
                })
            }),
            body: PostWorkspaceRoleRequest
        },
        responses: createApiResponse(WorkspaceRoleResponseSchema, 'Success')
    })
    workspaceRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/workspaces/{id}/archive',
        tags: ['Workspace'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Workspace UUID',
                    format: 'uuid'
                })
            }),
        },
        responses: createApiResponse(z.object({
            message: z.string(),
            workspace: WorkspaceResponseSchema
        }), 'Success'),
    })
    workspaceRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/workspaces/{id}/reopen',
        tags: ['Workspace'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Workspace UUID',
                    format: 'uuid'
                })
            }),
        },
        responses: createApiResponse(z.object({
            message: z.string(),
            workspace: WorkspaceResponseSchema
        }), 'Success'),
    })
    workspaceRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/workspaces/{id}',
        tags: ['Workspace'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Workspace UUID',
                    format: 'uuid'
                })
            }),
            body: PatchWorkspaceRequest
        },
        responses: createApiResponse(WorkspaceResponseSchema, 'Success'),
    })
    workspaceRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/workspaces/{id}/members/{userId}',
        tags: ['Workspace'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Workspace UUID',
                    format: 'uuid'
                }),
                userId: z.uuid().openapi({
                    example: 'b9860e3c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Workspace UUID',
                    format: 'uuid'
                }),
            }),
            body: PatchWorkspaceMemberRoleRequest
        },
        responses: createApiResponse(WorkspaceMemberResponseSchema, 'Success')
    })
    workspaceRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/workspaces/{id}/roles/{roleId}',
        tags: ['Workspace'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Workspace UUID',
                    format: 'uuid'
                }),
                roleId: z.uuid().openapi({
                    example: 'c3d4e5f6-7g8h-9i0j-1k2l-m3n4o5p6q7r8',
                    description: 'Role UUID',
                    format: 'uuid'
                })
            }),
            body: PatchWorkspaceRoleRequest
        },
        responses: createApiResponse(WorkspaceRoleResponseSchema, 'Success')
    })
    workspaceRegistry.registerPath({
        method: 'delete',
        path: '/api/v1/workspaces/{id}',
        tags: ['Workspace'],
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
        responses: createApiResponse(WorkspaceResponseSchema, 'Success'),
    })
    workspaceRegistry.registerPath({
        method: 'delete',
        path: '/api/v1/workspaces/{id}/members/{userId}',
        tags: ['Workspace'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Workspace UUID',
                    format: 'uuid'
                }),
                userId: z.uuid().openapi({
                    example: 'b9860e3c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'User UUID',
                    format: 'uuid'
                }),
            })
        },
        responses: createApiResponse(z.null(), 'Success')
    })
    workspaceRegistry.registerPath({
        method: 'delete',
        path: '/api/v1/workspaces/{id}/roles/{roleId}',
        tags: ['Workspace'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.uuid().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'Workspace UUID',
                    format: 'uuid'
                }),
                roleId: z.uuid().openapi({
                    example: 'c3d4e5f6-7g8h-9i0j-1k2l-m3n4o5p6q7r8',
                    description: 'Role UUID',
                    format: 'uuid'
                })
            })
        },
        responses: createApiResponse(z.object({
            message: z.string()
        }), 'Success')
    })
}

