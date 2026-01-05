import { Router } from "express";
import ChecklistItemController from "./checklist-item.controller";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { checkAuthentication } from "@/common/middleware/authentication";
import { checkChecklistItemPermission } from "@/common/middleware/authorization";
import { PERMISSIONS } from "@/common/constants/permissions";


export default function checklistItemRouter(checklistItemController: ChecklistItemController): Router {
    const router = Router();

    router.patch('/:itemId/content',
        asyncHandler(checkAuthentication),
        asyncHandler(checkChecklistItemPermission(PERMISSIONS.CARD_UPDATE)),
        asyncHandler(checklistItemController.renameChecklistItem));

    router.patch('/:itemId/status',
        asyncHandler(checkAuthentication),
        asyncHandler(checkChecklistItemPermission(PERMISSIONS.CARD_UPDATE)),
        asyncHandler(checklistItemController.updateChecklistItemStatus));

    router.delete('/:itemId',
        asyncHandler(checkAuthentication),
        asyncHandler(checkChecklistItemPermission(PERMISSIONS.CARD_UPDATE)),
        asyncHandler(checklistItemController.deleteChecklistItem));

    router.patch('/:itemId/reorder',
        asyncHandler(checkAuthentication),
        asyncHandler(checkChecklistItemPermission(PERMISSIONS.CARD_UPDATE)),
        asyncHandler(checklistItemController.reorderChecklistItem));

    return router;
}
