import { Router } from "express";
import WorkspaceController from "./workspace.controller";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { PERMISSIONS } from "@/common/constants/permissions";
import { checkBoardPermission, checkWorkspacePermission } from "@/common/middleware/authorization";
import { checkAuthentication } from "@/common/middleware/authentication";
import { performanceLogger } from "@/common/middleware/performanceLogger";

export default function workspaceRouter(workspaceController: WorkspaceController): Router {
    const router: Router = Router();

    // workspace and workspace member management
    router.get('/',
        asyncHandler(checkAuthentication),
        asyncHandler(workspaceController.findAll)
    )
    router.get('/:id/boards',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.BOARD_VIEW)),
        asyncHandler(workspaceController.getAllBoardFromWorkspace)
    )
    router.get('/:id/members',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_VIEW_MEMBERS)),
        asyncHandler(workspaceController.getWorkspaceMembers)
    )
    router.get('/:id/roles',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_MANAGE_ROLES)),
        asyncHandler(workspaceController.getWorkspaceRoles)
    )
    router.get('/:id',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_VIEW)),
        asyncHandler(workspaceController.findById)
    )

    router.post('/',
        asyncHandler(checkAuthentication),
        asyncHandler(workspaceController.create)
    )
    router.post('/:id/boards',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.BOARD_CREATE)),
        asyncHandler(workspaceController.addBoardToWorkspace)
    )

    router.post('/:id/roles',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_MANAGE_ROLES)),
        asyncHandler(workspaceController.addWorkspaceRole)
    )

    router.patch('/:id/members/:userId',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_MANAGE_MEMBERS)),
        asyncHandler(workspaceController.updateMemberRole)
    )
    router.patch('/:id/roles/:roleId',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_MANAGE_ROLES)),
        asyncHandler(workspaceController.updateWorkspaceRole)
    )
    router.patch('/:id/archive',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_UPDATE)),
        asyncHandler(workspaceController.archive)
    )
    router.patch('/:id/reopen',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_UPDATE)),
        asyncHandler(workspaceController.reopen)
    )
    router.patch('/:id',
        performanceLogger('PATCH /api/v1/workspaces/:id'),
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_UPDATE)),
        asyncHandler(workspaceController.update)
    )

    router.delete('/:id/members/:userId',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_MANAGE_MEMBERS)),
        asyncHandler(workspaceController.removeMemberFromWorkspace)
    )
    router.delete('/:id/roles/:roleId',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_MANAGE_ROLES)),
        asyncHandler(workspaceController.deleteWorkspaceRole)
    )
    router.delete('/:id',
        asyncHandler(checkAuthentication),
        asyncHandler(checkWorkspacePermission(PERMISSIONS.WORKSPACE_DELETE)),
        asyncHandler(workspaceController.delete)
    )
    return router
}