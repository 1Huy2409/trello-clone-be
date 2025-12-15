import { Router } from "express";
import ListController from "./list.controller";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { checkAuthentication } from "@/common/middleware/authentication";
import { PERMISSIONS } from "@/common/constants/permissions";
import { checkCrossListPermission, checkListPermission } from "@/common/middleware/authorization";

export default function listRouter(listController: ListController): Router {
    const router = Router();
    router.patch('/reorder',
        asyncHandler(checkAuthentication),
        asyncHandler(checkListPermission(PERMISSIONS.LIST_UPDATE)),
        asyncHandler(listController.reorderList)
    )
    router.patch('/move',
        asyncHandler(checkAuthentication),
        asyncHandler(checkCrossListPermission(PERMISSIONS.LIST_UPDATE, PERMISSIONS.LIST_CREATE)),
        asyncHandler(listController.moveList)
    )
    router.patch('/copy',
        asyncHandler(checkAuthentication),
        asyncHandler(checkCrossListPermission(PERMISSIONS.LIST_VIEW, PERMISSIONS.LIST_CREATE)),
        asyncHandler(listController.copyList)
    )
    router.patch('/:listId/name',
        asyncHandler(checkAuthentication),
        asyncHandler(checkListPermission(PERMISSIONS.LIST_UPDATE)),
        asyncHandler(listController.editListName)
    )
    router.patch('/:listId/archive',
        asyncHandler(checkAuthentication),
        asyncHandler(checkListPermission(PERMISSIONS.LIST_DELETE)),
        asyncHandler(listController.archiveList)
    )
    router.patch('/:listId/reopen',
        asyncHandler(checkAuthentication),
        asyncHandler(checkListPermission(PERMISSIONS.LIST_DELETE)),
        asyncHandler(listController.reopenList)
    )
    return router;
} 