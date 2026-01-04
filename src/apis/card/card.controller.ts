import { Request, Response } from "express";
import CardService from "./card.service";
import { CopyCardSchema, MoveCardSchema, ReorderCardSchema, UpdateCardSchema } from "./schemas/card/card.request.schema";
import { AuthFailureError, BadRequestError } from "@/common/handler/error.response";
import { ResponseStatus, ServiceResponse } from "@/common/models/service.response";
import { StatusCodes } from "http-status-codes";
import { handleServiceResponse } from "@/common/utils/httpHandler";
import ChecklistService from "../checklist/checklist.service";
import { CreateChecklistSchema } from "../checklist/schemas";

export default class CardController {
    constructor(
        private cardService: CardService,
        private checklistService: ChecklistService
    ) { }

    updateCard = async (req: Request, res: Response) => {
        const cardId = req.params.id;
        if (!cardId) {
            throw new BadRequestError('Card ID is required');
        }
        const data: UpdateCardSchema = req.body;
        const updatedCard = await this.cardService.updateCard(cardId, data);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Update card successfully',
            updatedCard,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    archiveCard = async (req: Request, res: Response) => {
        const cardId = req.params.id;
        if (!cardId) {
            throw new BadRequestError('Card ID is required');
        }
        const archivedCard = await this.cardService.archiveCard(cardId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Archive card successfully',
            archivedCard,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    reopenCard = async (req: Request, res: Response) => {
        const cardId = req.params.id;
        if (!cardId) {
            throw new BadRequestError('Card ID is required');
        }
        const reopenedCard = await this.cardService.reopenCard(cardId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Reopen card successfully',
            reopenedCard,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }

    moveCard = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AuthFailureError('User not authenticated');
        }
        const moveData: MoveCardSchema = req.body;
        const movedCard = await this.cardService.moveCard(moveData, userId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Move card successfully',
            movedCard,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    copyCard = async (req: Request, res: Response) => {
        const copyData: CopyCardSchema = req.body;
        const copiedCard = await this.cardService.copyCard(copyData);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Copy card successfully',
            copiedCard,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    reorderCard = async (req: Request, res: Response) => {
        const reorderData: ReorderCardSchema = req.body;
        const reorderedCard = await this.cardService.reorderCard(reorderData);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Reorder card successfully',
            reorderedCard,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    assignMemberToCard = async (req: Request, res: Response) => {
        const cardId = req.params.id || req.params.cardId;
        const userId = req.body.userId;
        if (!cardId || !userId) {
            throw new BadRequestError('Card ID and User ID are required');
        }
        const assignedCardMember = await this.cardService.assignMemberToCard(cardId, userId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Assign member to card successfully',
            assignedCardMember,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    removeMemberFromCard = async (req: Request, res: Response) => {
        const cardId = req.params.id || req.params.cardId;
        const userId = req.body.userId;
        if (!cardId || !userId) {
            throw new BadRequestError('Card ID and User ID are required');
        }
        const removedCardMember = await this.cardService.removeMemberFromCard(cardId, userId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Remove member from card successfully',
            removedCardMember,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }

    getCardMembers = async (req: Request, res: Response) => {
        const cardId = req.params.id || req.params.cardId;
        if (!cardId) {
            throw new BadRequestError('Card ID is required');
        }
        const cardMembers = await this.cardService.getCardMembers(cardId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get card members successfully',
            cardMembers,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }

    createChecklist = async (req: Request, res: Response) => {
        console.log('Controller already hit');
        const cardId = req.params.id || req.params.cardId;
        if (!cardId) {
            throw new BadRequestError('Card ID is required');
        }
        const checklistData: CreateChecklistSchema = req.body;
        const newChecklist = await this.checklistService.createChecklist(cardId, checklistData);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Create checklist successfully',
            newChecklist,
            StatusCodes.CREATED
        )
        return handleServiceResponse(serviceResponse, res);
    }
}