import { Router } from "express";
import BoardController from "./board.controller";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { checkAuthentication } from "@/common/middleware/authentication";
import { checkBoardPermission, checkWorkspacePermission } from "@/common/middleware/authorization";
import { PERMISSIONS } from "@/common/constants/permissions";


export default function boardRouter(boardController: BoardController): Router {
    const router: Router = Router()

    router.get('/public', asyncHandler(boardController.getAllPublicBoards))
    router.get('/public/:id', asyncHandler(boardController.getPublicBoardById))
    router.get('/:id/invite/links',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_VIEW_MEMBERS)),
        asyncHandler(boardController.getBoardJoinLinks)
    )
    router.get('/:id/members',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_VIEW)),
        asyncHandler(boardController.getBoardMembers)
    )
    router.get('/:boardId/lists',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.LIST_VIEW)),
        asyncHandler(boardController.getListsByBoardId)
    )

    router.post('/',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.BOARD_CREATE)),
        asyncHandler(boardController.createBoard)
    )
    router.post('/join',
        asyncHandler(checkAuthentication),
        asyncHandler(boardController.joinBoardByLink)
    )
    router.post('/:id/invite/link',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_MANAGE_MEMBERS)),
        asyncHandler(boardController.createBoardJoinLink)
    )
    router.post('/:id/invite/email',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_MANAGE_MEMBERS)),
        asyncHandler(boardController.inviteByEmail)
    )
    router.post('/:boardId/lists',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.LIST_CREATE)),
        asyncHandler(boardController.createList)
    )
    router.post('/:id/reopen',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_UPDATE)),
        asyncHandler(boardController.reopenBoard)
    )
    router.post('/:id/change-owner',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_UPDATE)),
        asyncHandler(boardController.changeOwner)
    )

    router.patch('/:id/invite/link/:linkId/revoke',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_MANAGE_MEMBERS)),
        asyncHandler(boardController.revokeBoardJoinLink)
    )
    router.patch('/:boardId',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_UPDATE)),
        asyncHandler(boardController.updateBoard)
    )
    router.delete('/:boardId',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_DELETE)),
        asyncHandler(boardController.deleteBoard)
    )
    router.delete('/:id/invite/link/:linkId',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_MANAGE_MEMBERS)),
        asyncHandler(boardController.deleteBoardJoinLink)
    )
    router.delete('/:id/permanent',
        asyncHandler(checkAuthentication),
        asyncHandler(checkBoardPermission(PERMISSIONS.BOARD_DELETE)),
        asyncHandler(boardController.deletePermanent)
    )

    return router;
}
