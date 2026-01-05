import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { ChecklistResponseSchema, ReorderChecklistRequest, UpdateChecklistRequest } from "./schemas";
import { CreateChecklistItemRequest } from "@/apis/checklist-item/schemas";
import { ChecklistItemResponseSchema } from "@/apis/checklist-item/schemas/checklist-item.response.schema";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilder";
import z from "zod";

export const checklistRegistry = new OpenAPIRegistry();
checklistRegistry.register('Checklist', ChecklistResponseSchema)
checklistRegistry.register('ChecklistItem', ChecklistItemResponseSchema)

export function registerChecklistPaths() {
    checklistRegistry.registerPath({
        method: 'get',
        path: '/api/v1/checklists/{checklistId}/items',
        description: 'Get checklist items of a checklist',
        tags: ['Checklist'],
        summary: 'Get Checklist Items',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                checklistId: z.uuid().openapi({ description: 'ID of the checklist to get items for', example: 'f90a806a-bcb7-4e1a-94b7-9835a62e8a18' })
            })
        },
        responses: createApiResponse(z.array(ChecklistItemResponseSchema), 'Success')
    })
    checklistRegistry.registerPath({
        method: 'post',
        path: '/api/v1/checklists/{checklistId}/items',
        description: 'Create a checklist item',
        tags: ['Checklist'],
        summary: 'Create Checklist Item',
        security: [{ bearerAuth: [] }],
        request: {
            body: CreateChecklistItemRequest,
            params: z.object({
                checklistId: z.uuid().openapi({ description: 'ID of the checklist to create item for', example: 'f90a806a-bcb7-4e1a-94b7-9835a62e8a18' })
            })
        },
        responses: createApiResponse(ChecklistItemResponseSchema, 'Success')
    })
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