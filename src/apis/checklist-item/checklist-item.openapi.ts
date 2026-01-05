import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { ChecklistItemResponseSchema } from "./schemas/checklist-item.response.schema";
import { ReorderChecklistItemRequest, UpdateContentChecklistItemRequest, UpdateStatusChecklistItemRequest } from "./schemas/checklist-item.request.schema";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilder";
import z from "zod";

export const checklistItemRegistry = new OpenAPIRegistry();
checklistItemRegistry.register('ChecklistItem', ChecklistItemResponseSchema);

export function registerChecklistItemPaths() {
    checklistItemRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/checklist-items/{itemId}/content',
        description: 'Rename a checklist item',
        tags: ['ChecklistItem'],
        summary: 'Rename Checklist Item',
        security: [{ bearerAuth: [] }],
        request: {
            body: UpdateContentChecklistItemRequest,
            params: z.object({
                itemId: z.uuid().openapi({ description: 'ID of the checklist item to rename', example: 'f90a806a-bcb7-4e1a-94b7-9835a62e8a18' })
            })
        },
        responses: createApiResponse(ChecklistItemResponseSchema, 'Success')
    });

    checklistItemRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/checklist-items/{itemId}/status',
        description: 'Update status of a checklist item (complete/incomplete)',
        tags: ['ChecklistItem'],
        summary: 'Update Checklist Item Status',
        security: [{ bearerAuth: [] }],
        request: {
            body: UpdateStatusChecklistItemRequest,
            params: z.object({
                itemId: z.uuid().openapi({ description: 'ID of the checklist item to update status', example: 'f90a806a-bcb7-4e1a-94b7-9835a62e8a18' })
            })
        },
        responses: createApiResponse(ChecklistItemResponseSchema, 'Success')
    });

    checklistItemRegistry.registerPath({
        method: 'delete',
        path: '/api/v1/checklist-items/{itemId}',
        description: 'Delete a checklist item',
        tags: ['ChecklistItem'],
        summary: 'Delete Checklist Item',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                itemId: z.uuid().openapi({ description: 'ID of the checklist item to delete', example: 'f90a806a-bcb7-4e1a-94b7-9835a62e8a18' })
            })
        },
        responses: createApiResponse(z.null(), 'Success')
    });

    checklistItemRegistry.registerPath({
        method: 'patch',
        path: '/api/v1/checklist-items/{itemId}/reorder',
        description: 'Reorder a checklist item',
        tags: ['ChecklistItem'],
        summary: 'Reorder Checklist Item',
        security: [{ bearerAuth: [] }],
        request: {
            body: ReorderChecklistItemRequest,
            params: z.object({
                itemId: z.uuid().openapi({ description: 'ID of the checklist item to reorder', example: 'f90a806a-bcb7-4e1a-94b7-9835a62e8a18' })
            })
        },
        responses: createApiResponse(z.array(ChecklistItemResponseSchema), 'Success')
    });
}
