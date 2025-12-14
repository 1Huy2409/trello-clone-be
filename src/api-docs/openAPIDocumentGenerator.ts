import { authRegistry } from "@/apis/auth/auth.router";
import { boardRegistry } from "@/apis/board/board.router";
import { healthCheckRegistry } from "@/apis/healthcheck/healthcheck.router";
import { joinLinkRegistry } from "@/apis/joinlink/join-link.router";
import { listRegistry } from "@/apis/list/list.openapi";
import { userRegistry } from "@/apis/user/user.router";
import { workspaceRegistry } from "@/apis/workspace/workspace.router";
import { OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export function generateOpenAPIDocument(): ReturnType<InstanceType<typeof OpenApiGeneratorV3>['generateDocument']> {
    const registry = new OpenAPIRegistry([userRegistry, healthCheckRegistry, authRegistry, workspaceRegistry, boardRegistry, joinLinkRegistry, listRegistry])
    registry.registerComponent('securitySchemes', 'bearerAuth', {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    })
    const generator = new OpenApiGeneratorV3(registry.definitions)
    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Swagger API',
        },
        externalDocs: {
            description: 'View the raw OpenAPI Specification in JSON format',
            url: '/swagger.json',
        },
    })
}