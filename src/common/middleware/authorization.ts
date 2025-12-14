import { AuthorizationHelper } from "../utils/authorizationHelper";
import { NextFunction, Request, Response } from "express";
import { AuthFailureError, BadRequestError, ForbiddenError } from "../handler/error.response";
import { PermissionKey } from "../constants/permissions";

const authorizationHelper = new AuthorizationHelper();

export const checkWorkspacePermission = (requiredPermission: PermissionKey) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id
            if (!userId) {
                throw new AuthFailureError('User not authenticated', 401);
            }
            const workspaceId = req.params.workspaceId || req.params.id || req.body.workspaceId;
            if (!workspaceId) {
                throw new BadRequestError('Workspace ID is required');
            }
            const hasPermission = await authorizationHelper.canAccessWorkspace(
                userId,
                workspaceId,
                requiredPermission
            )
            if (!hasPermission) {
                throw new ForbiddenError('You do not have permission to access this workspace');
            }
            next();
        }
        catch (error) {
            next(error)
        }
    }
}
export const checkBoardPermission = (requiredPermission: PermissionKey) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id
            if (!userId) {
                throw new AuthFailureError('User not authenticated', 401);
            }
            const boardId = req.params.boardId || req.params.id || req.body.boardId;
            console.log("Checking board permission for boardId:", boardId);
            if (!boardId) {
                throw new BadRequestError('Board ID is required');
            }
            const hasPermission = await authorizationHelper.canAccessBoard(
                userId,
                boardId,
                requiredPermission
            )
            if (!hasPermission) {
                throw new ForbiddenError('You do not have permission to access this board');
            }
            next();
        }
        catch (error) {
            console.error('Error in checkBoardPermission middleware:', error);
            next(error)
        }
    }
}