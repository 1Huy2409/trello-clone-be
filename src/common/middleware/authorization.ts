import { AuthorizationHelper } from "../utils/authorizationHelper";
import { NextFunction, Request, Response } from "express";
import { AuthFailureError, BadRequestError, ForbiddenError } from "../handler/error.response";
import { PermissionKey } from "../constants/permissions";
import { ListRepository } from "@/apis/list/repositories/list.repository";
import { IListRepository } from "@/apis/list/repositories/list.repository.interface";
import { AppDataSource } from "@/config/db.config";
import { List } from "../entities/list.entity";
import { CardRepository } from "@/apis/card/repositories/card.repository";
import { Card } from "../entities/card.entity";
import { ChecklistRepository } from "@/apis/checklist/repositories/checklist.repository";
import { Checklist } from "../entities/checklist.entity";
const authorizationHelper = new AuthorizationHelper();
const listRepository = new ListRepository(AppDataSource.getRepository(List));
const cardRepository = new CardRepository(AppDataSource.getRepository(Card));
const checklistRepository = new ChecklistRepository(AppDataSource.getRepository(Checklist));
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
export const checkListPermission = (requiredPermission: PermissionKey) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id
            if (!userId) {
                throw new AuthFailureError('User not authenticated', 401);
            }
            const listId = req.params.listId || req.params.id || req.body.listId;
            if (!listId) {
                throw new BadRequestError('List ID is required');
            }
            const list = await listRepository.findFullListById(listId);
            if (!list) {
                throw new BadRequestError(`List with ID ${listId} not found`);
            }
            const boardId = list.boardId;
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
            console.error('Error in checkListPermission middleware:', error);
            next(error)
        }
    }
}
export const checkCrossListPermission = (
    sourcePermission: PermissionKey,
    targetPermission: PermissionKey
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id
            if (!userId) {
                throw new AuthFailureError('User not authenticated', 401);
            }
            const { listId, targetBoardId } = req.body;
            if (!listId) {
                throw new BadRequestError('Source List ID is required');
            }
            if (!targetBoardId) {
                throw new BadRequestError('Target Board ID is required');
            }
            const list = await listRepository.findFullListById(listId);
            if (!list) {
                throw new BadRequestError(`List with ID ${listId} not found`);
            }
            const sourceBoardId = list.boardId;
            const hasSourcePermission = await authorizationHelper.canAccessBoard(
                userId,
                sourceBoardId,
                sourcePermission
            )
            if (!hasSourcePermission) {
                throw new ForbiddenError('You do not have permission to access the source board');
            }
            const hasTargetPermission = await authorizationHelper.canAccessBoard(
                userId,
                targetBoardId,
                targetPermission
            )
            if (!hasTargetPermission) {
                throw new ForbiddenError('You do not have permission to access the target board');
            }
            next();
        }
        catch (error) {
            console.error('Error in checkCrossListPermission middleware:', error);
            next(error)
        }
    }
}
export const checkCardPermission = (requiredPermission: PermissionKey) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id
            if (!userId) {
                throw new AuthFailureError('User not authenticated', 401);
            }
            const cardId = req.params.cardId || req.params.id || req.body.cardId;
            if (!cardId) {
                throw new BadRequestError('Card ID is required');
            }
            const card = await cardRepository.getCardById(cardId);
            if (!card) {
                throw new BadRequestError(`Card with ID ${cardId} not found`);
            }
            const boardId = card.boardId;
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
            console.error('Error in checkCardPermission middleware:', error);
            next(error)
        }
    }
}
export const checkCrossCardPermission = (
    sourcePermission: PermissionKey,
    targetPermission: PermissionKey
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id
            if (!userId) {
                throw new AuthFailureError('User not authenticated', 401);
            }
            const { cardId, targetBoardId } = req.body;
            if (!cardId) {
                throw new BadRequestError('Source Card ID is required');
            }
            if (!targetBoardId) {
                throw new BadRequestError('Target Board ID is required');
            }
            const card = await cardRepository.getCardById(cardId);
            if (!card) {
                throw new BadRequestError(`Card with ID ${cardId} not found`);
            }
            const sourceBoardId = card.boardId;
            const hasSourcePermission = await authorizationHelper.canAccessBoard(
                userId,
                sourceBoardId,
                sourcePermission
            )
            if (!hasSourcePermission) {
                throw new ForbiddenError('You do not have permission to access the source board');
            }
            const hasTargetPermission = await authorizationHelper.canAccessBoard(
                userId,
                targetBoardId,
                targetPermission
            )
            if (!hasTargetPermission) {
                throw new ForbiddenError('You do not have permission to access the target board');
            }
            next();
        }
        catch (error) {
            console.error('Error in checkCrossCardPermission middleware:', error);
            next(error)
        }
    }
}
export const checkChecklistPermission = (requiredPermission: PermissionKey) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id
            if (!userId) {
                throw new AuthFailureError('User not authenticated', 401);
            }
            const checklistId = req.params.checklistId || req.params.id || req.body.checklistId;
            if (!checklistId) {
                throw new BadRequestError('Checklist ID is required');
            }
            const checklist = await checklistRepository.getChecklistById(checklistId);
            if (!checklist) {
                throw new BadRequestError(`Checklist with ID ${checklistId} not found`);
            }
            const cardId = checklist.cardId;
            const card = await cardRepository.getCardById(cardId);
            if (!card) {
                throw new BadRequestError(`Card with ID ${cardId} not found`);
            }
            const boardId = card.boardId;
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
            console.error('Error in checkChecklistPermission middleware:', error);
            next(error)
        }
    }
}