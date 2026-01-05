import { Router } from "express";
import ChecklistController from "./checklist.controller";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { checkAuthentication } from "@/common/middleware/authentication";
import { checkCardPermission, checkChecklistPermission } from "@/common/middleware/authorization";
import { PERMISSIONS } from "@/common/constants/permissions";

export default function checklistRouter(checklistController: ChecklistController): Router {
    const router = Router();

    router.get('/:checklistId/items',
        asyncHandler(checkAuthentication),
        asyncHandler(checkChecklistPermission(PERMISSIONS.CARD_VIEW)),
        asyncHandler(checklistController.getChecklistItemsByChecklistId)
    )
    router.patch('/:checklistId/reorder',
        asyncHandler(checkAuthentication),
        asyncHandler(checkChecklistPermission(PERMISSIONS.CARD_UPDATE)),
        asyncHandler(checklistController.reorderChecklist));

    router.post('/:checklistId/items',
        asyncHandler(checkAuthentication),
        asyncHandler(checkChecklistPermission(PERMISSIONS.CARD_UPDATE)),
        asyncHandler(checklistController.createChecklistItem));

    router.post('/:checklistId/copy',
        asyncHandler(checkAuthentication),
        asyncHandler(checkChecklistPermission(PERMISSIONS.CARD_UPDATE)),
        asyncHandler(checklistController.copyChecklist));

    router.patch('/:checklistId',
        asyncHandler(checkAuthentication),
        asyncHandler(checkChecklistPermission(PERMISSIONS.CARD_UPDATE)),
        asyncHandler(checklistController.updateChecklist));
    router.delete('/:checklistId',
        asyncHandler(checkAuthentication),
        asyncHandler(checkChecklistPermission(PERMISSIONS.CARD_UPDATE)),
        asyncHandler(checklistController.deleteChecklist));

    return router;
}