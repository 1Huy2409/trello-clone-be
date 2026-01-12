import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

export const permissionRegistry = new OpenAPIRegistry();

export const registerPermissionPaths = () => {
    permissionRegistry.registerPath({
        method: 'get',
        path: '/api/v1/permissions',
        tags: ['Permission'],
        security: [{ bearerAuth: [] }],
        summary: 'Get all permissions',
        responses: {
            200: {
                description: 'Get all permissions successfully',
                content: {
                    'application/json': {
                        schema: z.object({
                            status: z.string(),
                            message: z.string(),
                            data: z.array(z.object({
                                id: z.string(),
                                action: z.string(),
                                description: z.string().nullable(),
                                resourceType: z.string()
                            })),
                            statusCode: z.number()
                        })
                    }
                }
            }
        }
    });
}
