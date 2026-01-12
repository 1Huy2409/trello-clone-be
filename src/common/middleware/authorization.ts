
import { AuthorizationHelper } from "../utils/authorizationHelper";
import { NextFunction, Request, Response } from "express";
import { AuthFailureError, BadRequestError, ForbiddenError, NotFoundError } from "../handler/error.response";
import { PermissionKey } from "../constants/permissions";
import { ListRepository } from "@/apis/list/repositories/list.repository";
import { AppDataSource } from "@/config/db.config";
import { List } from "../entities/list.entity";
import { CardRepository } from "@/apis/card/repositories/card.repository";
import { Card } from "../entities/card.entity";
import { ChecklistRepository } from "@/apis/checklist/repositories/checklist.repository";
import { Checklist } from "../entities/checklist.entity";
import { ChecklistItemRepository } from "@/apis/checklist-item/repositories/checklist-item.repository";
import { ChecklistItem } from "../entities/checklist-item.entity";
import { AttachmentRepository } from "@/apis/attachment/repositories/attachment.repository";
import { Attachment } from "../entities/attachment.entity";

const authorizationHelper = new AuthorizationHelper();
const listRepository = new ListRepository(AppDataSource.getRepository(List));
const cardRepository = new CardRepository(AppDataSource.getRepository(Card));
const checklistRepository = new ChecklistRepository(AppDataSource.getRepository(Checklist));
const checklistItemRepository = new ChecklistItemRepository(AppDataSource.getRepository(ChecklistItem));
const attachmentRepository = new AttachmentRepository(AppDataSource.getRepository(Attachment));

type PermissionContext = { workspaceId?: string; boardId?: string } | null;
type ContextResolver = (req: Request) => Promise<PermissionContext> | PermissionContext;

const Resolvers = {
    fromWorkspaceId: (req: Request): PermissionContext => {
        const workspaceId = req.params.workspaceId || req.params.id || req.body.workspaceId;
        return workspaceId ? { workspaceId } : null;
    },

    fromBoardId: (req: Request): PermissionContext => {
        const boardId = req.params.boardId || req.params.id || req.body.boardId;
        // console.log("Checking board permission for boardId:", boardId);
        return boardId ? { boardId } : null;
    },

    fromListId: async (req: Request): Promise<PermissionContext> => {
        const listId = req.params.listId || req.params.id || req.body.listId;
        if (!listId) return null;

        const list = await listRepository.findFullListById(listId);
        if (!list) return null; // Or throw NotFound? Factory handles null as NotFound usually.

        return { boardId: list.boardId };
    },

    fromCardId: async (req: Request): Promise<PermissionContext> => {
        const cardId = req.params.cardId || req.params.id || req.body.cardId;
        if (!cardId) return null;

        const card = await cardRepository.getCardById(cardId);
        if (!card) return null;

        return { boardId: card.boardId };
    },

    fromChecklistId: async (req: Request): Promise<PermissionContext> => {
        const checklistId = req.params.checklistId || req.params.id || req.body.checklistId;
        if (!checklistId) return null;

        const checklist = await checklistRepository.getChecklistById(checklistId);
        if (!checklist) return null;

        const card = await cardRepository.getCardById(checklist.cardId);
        if (!card) return null;

        return { boardId: card.boardId };
    },

    fromChecklistItemId: async (req: Request): Promise<PermissionContext> => {
        const checklistItemId = req.params.itemId || req.params.id || req.body.itemId;
        if (!checklistItemId) return null;

        const checklistItem = await checklistItemRepository.findById(checklistItemId);
        if (!checklistItem) return null;

        const checklist = await checklistRepository.getChecklistById(checklistItem.checklistId);
        if (!checklist) return null;

        const card = await cardRepository.getCardById(checklist.cardId);
        if (!card) return null;

        return { boardId: card.boardId };
    },

    fromAttachmentId: async (req: Request): Promise<PermissionContext> => {
        const attachmentId = req.params.id; // Attachment often passes ID in main param
        if (attachmentId) {
            const attachment = await attachmentRepository.getById(attachmentId);
            if (!attachment) return null;
            const card = await cardRepository.getCardById(attachment.cardId);
            if (!card) return null;
            return { boardId: card.boardId };
        }

        // Fallback or specific create case logic where attachment isn't created yet but cardId is passed
        const cardId = req.body.cardId || req.params.cardId;
        if (cardId) {
            const card = await cardRepository.getCardById(cardId);
            if (!card) return null;
            return { boardId: card.boardId };
        }

        return null;
    }
};

// --- Middleware Factory ---
export const requirePermission = (
    permission: PermissionKey,
    resolveContext: ContextResolver
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new AuthFailureError('User not authenticated');
            }

            const context = await resolveContext(req);
            if (!context) {
                throw new NotFoundError('Resource not found or missing ID');
            }

            const { workspaceId, boardId } = context;
            let hasPermission = false;

            if (boardId) {
                hasPermission = await authorizationHelper.canAccessBoard(userId, boardId, permission);
            } else if (workspaceId) {
                hasPermission = await authorizationHelper.canAccessWorkspace(userId, workspaceId, permission);
            }

            if (!hasPermission) {
                throw new ForbiddenError('You do not have permission to access this resource');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// --- Single Check Exports (Backward Compatibility) ---
export const checkWorkspacePermission = (p: PermissionKey) => requirePermission(p, Resolvers.fromWorkspaceId);
export const checkBoardPermission = (p: PermissionKey) => requirePermission(p, Resolvers.fromBoardId);
export const checkListPermission = (p: PermissionKey) => requirePermission(p, Resolvers.fromListId);
export const checkCardPermission = (p: PermissionKey) => requirePermission(p, Resolvers.fromCardId);
export const checkChecklistPermission = (p: PermissionKey) => requirePermission(p, Resolvers.fromChecklistId);
export const checkChecklistItemPermission = (p: PermissionKey) => requirePermission(p, Resolvers.fromChecklistItemId);
export const checkAttachmentPermission = (p: PermissionKey) => requirePermission(p, Resolvers.fromAttachmentId);


// --- Cross-Check Middlewares (Keeping specialized logic but simplified) ---
export const checkCrossListPermission = (
    sourcePermission: PermissionKey,
    targetPermission: PermissionKey
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AuthFailureError('User not authenticated');

            const { listId, targetBoardId } = req.body;
            if (!listId) throw new BadRequestError('Source List ID is required');
            if (!targetBoardId) throw new BadRequestError('Target Board ID is required');

            // Source Check
            const list = await listRepository.findFullListById(listId);
            if (!list) throw new NotFoundError(`List with ID ${listId} not found`);
            const sourceBoardId = list.boardId;

            const hasSourcePermission = await authorizationHelper.canAccessBoard(userId, sourceBoardId, sourcePermission);
            if (!hasSourcePermission) throw new ForbiddenError('You do not have permission to access the source board');

            // Target Check
            const hasTargetPermission = await authorizationHelper.canAccessBoard(userId, targetBoardId, targetPermission);
            if (!hasTargetPermission) throw new ForbiddenError('You do not have permission to access the target board');

            next();
        } catch (error) {
            next(error);
        }
    }
}

export const checkCrossCardPermission = (
    sourcePermission: PermissionKey,
    targetPermission: PermissionKey
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AuthFailureError('User not authenticated');

            const { cardId, targetBoardId } = req.body;
            if (!cardId) throw new BadRequestError('Source Card ID is required');
            if (!targetBoardId) throw new BadRequestError('Target Board ID is required');

            // Source Check
            const card = await cardRepository.getCardById(cardId);
            if (!card) throw new NotFoundError(`Card with ID ${cardId} not found`);
            const sourceBoardId = card.boardId;

            const hasSourcePermission = await authorizationHelper.canAccessBoard(userId, sourceBoardId, sourcePermission);
            if (!hasSourcePermission) throw new ForbiddenError('You do not have permission to access the source board');

            // Target Check
            const hasTargetPermission = await authorizationHelper.canAccessBoard(userId, targetBoardId, targetPermission);
            if (!hasTargetPermission) throw new ForbiddenError('You do not have permission to access the target board');

            next();
        } catch (error) {
            next(error);
        }
    }
}