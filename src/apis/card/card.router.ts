import { Router } from "express";
import CardController from "./card.controller";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { checkAuthentication } from "@/common/middleware/authentication";
import { checkCardPermission, checkCrossCardPermission } from "@/common/middleware/authorization";
import { PERMISSIONS } from "@/common/constants/permissions";

export default function cardRouter(cardController: CardController): Router {
    const router = Router();

    router.patch('/move',
        asyncHandler(checkAuthentication),
        asyncHandler(checkCrossCardPermission(PERMISSIONS.CARD_UPDATE, PERMISSIONS.CARD_CREATE)),
        asyncHandler(cardController.moveCard)
    )
    router.patch('/reorder',
        asyncHandler(checkAuthentication),
        asyncHandler(checkCardPermission(PERMISSIONS.CARD_UPDATE)),
        asyncHandler(cardController.reorderCard)
    )
    router.patch('/copy',
        asyncHandler(checkAuthentication),
        asyncHandler(checkCrossCardPermission(PERMISSIONS.CARD_VIEW, PERMISSIONS.CARD_CREATE)),
        asyncHandler(cardController.copyCard)
    )

    router.patch('/:id/archive',
        asyncHandler(checkAuthentication),
        asyncHandler(checkCardPermission(PERMISSIONS.CARD_DELETE)),
        asyncHandler(cardController.archiveCard)
    )
    router.patch('/:id/reopen',
        asyncHandler(checkAuthentication),
        asyncHandler(checkCardPermission(PERMISSIONS.CARD_DELETE)),
        asyncHandler(cardController.reopenCard)
    )
    router.patch('/:id',
        asyncHandler(checkAuthentication),
        asyncHandler(checkCardPermission(PERMISSIONS.CARD_UPDATE)),
        asyncHandler(cardController.updateCard)
    )

    return router;
}