import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { ListUserResponseSchema, PatchUserProfileRequest, UploadAvatarRequest, UserResponseSchema } from "./schemas";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilder";
import z from "zod";

export const userRegistry = new OpenAPIRegistry()
userRegistry.register('User', UserResponseSchema);
export function registerUserPaths() {
    userRegistry.registerPath({
        method: 'get',
        path: '/api/v1/users',
        tags: ['User'],
        responses: createApiResponse(ListUserResponseSchema, 'Success'),
    });
    userRegistry.registerPath({
        method: 'get',
        path: '/api/v1/users/me',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        responses: createApiResponse(UserResponseSchema, 'Success'),
    });
    userRegistry.registerPath({
        method: 'get',
        path: '/api/v1/users/{id}',
        tags: ['User'],
        request: {
            params: z.object({
                id: z.string().openapi({
                    example: 'b9860e4c-5ba0-4715-b483-87fc69bfc6ef',
                    description: 'User UUID',
                    format: 'uuid'
                })
            }),
        },
        responses: createApiResponse(UserResponseSchema, 'Success')
    })
    userRegistry.registerPath({
        method: 'get',
        path: '/api/v1/users/me',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        responses: createApiResponse(UserResponseSchema, 'Success')
    })
    userRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/users/profile',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        request: {
            body: PatchUserProfileRequest
        },
        responses: createApiResponse(UserResponseSchema, 'Success')
    });
    userRegistry.registerPath({
        method: 'post',
        path: '/api/v1/users/avatar',
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        request: {
            body: UploadAvatarRequest
        },
        responses: createApiResponse(UserResponseSchema, 'Success')
    });
}