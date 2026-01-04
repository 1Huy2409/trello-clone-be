import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { ChecklistResponseSchema, ReorderChecklistRequest, UpdateChecklistRequest } from "./schemas";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilder";
import z from "zod";

export const checklistRegistry = new OpenAPIRegistry();
checklistRegistry.register('Checklist', ChecklistResponseSchema)

export function registerChecklistPaths() {
    checklistRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/checklists/{checklistId}/reorder',
        description: 'Reorder a checklist within its card',
        tags: ['Checklist'],
        summary: 'Reorder Checklist',
        security: [{ bearerAuth: [] }],
        request: {
            body: ReorderChecklistRequest,
            params: z.object({
                checklistId: z.uuid().openapi({ description: 'ID of the checklist to reorder', example: 'f90a806a-bcb7-4e1a-94b7-9835a62e8a18' })
            })
        },
        responses: createApiResponse(z.array(ChecklistResponseSchema), 'Success')
    })
    checklistRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/checklists/{checklistId}',
        description: 'Update a checklist',
        tags: ['Checklist'],
        summary: 'Update Checklist',
        security: [{ bearerAuth: [] }],
        request: {
            body: UpdateChecklistRequest,
            params: z.object({
                checklistId: z.uuid().openapi({ description: 'ID of the checklist to update', example: 'f90a806a-bcb7-4e1a-94b7-9835a62e8a18' })
            })
        },
        responses: createApiResponse(ChecklistResponseSchema, 'Success')
    })
    checklistRegistry.registerPath({
        method: 'delete',
        path: '/api/v1/checklists/{checklistId}',
        description: 'Delete a checklist',
        tags: ['Checklist'],
        summary: 'Delete Checklist',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                checklistId: z.uuid().openapi({ description: 'ID of the checklist to delete', example: 'f90a806a-bcb7-4e1a-94b7-9835a62e8a18' })
            })
        },
        responses: createApiResponse(z.null(), 'Success')
    })
}