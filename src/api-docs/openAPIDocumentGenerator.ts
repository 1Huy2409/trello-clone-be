import { authRegistry } from "@/apis/auth/auth.openapi";
import { boardRegistry } from "@/apis/board/board.openapi";
import { cardRegistry } from "@/apis/card/card.openapi";
import { checklistRegistry } from "@/apis/checklist/checklist.openapi";
import { healthCheckRegistry } from "@/apis/healthcheck/healthcheck.openapi";
import { joinLinkRegistry } from "@/apis/joinlink/join-link.openapi";
import { listRegistry } from "@/apis/list/list.openapi";
import { userRegistry } from "@/apis/user/user.openapi";
import { workspaceRegistry } from "@/apis/workspace/workspace.openapi";
import { checklistItemRegistry } from "@/apis/checklist-item/checklist-item.openapi";
import { attachmentRegistry } from "@/apis/attachment/attachment.openapi";
import { permissionRegistry } from "@/apis/permission/permission.openapi";
import { OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export function generateOpenAPIDocument(): ReturnType<InstanceType<typeof OpenApiGeneratorV3>['generateDocument']> {
    const registry = new OpenAPIRegistry([userRegistry, healthCheckRegistry, authRegistry, workspaceRegistry, boardRegistry, joinLinkRegistry, listRegistry, cardRegistry, checklistRegistry, checklistItemRegistry, attachmentRegistry, permissionRegistry])
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