import { createApiResponse } from "@/api-docs/openAPIResponseBuilder";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";

export const healthCheckRegistry = new OpenAPIRegistry();

export function registerHealthCheckPaths() {
    healthCheckRegistry.registerPath({
        method: 'get',
        path: '/api/v1/health-check',
        tags: ['Health Check'],
        responses: createApiResponse(z.null(), 'Success')
    })
}