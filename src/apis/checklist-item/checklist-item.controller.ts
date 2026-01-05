import { Request, Response } from "express";
import ChecklistItemService from "./checklist-item.service";
import { ReorderChecklistItemSchema, UpdateContentChecklistItemSchema, UpdateStatusChecklistItemSchema } from "./schemas";
import { ResponseStatus, ServiceResponse } from "@/common/models/service.response";
import { StatusCodes } from "http-status-codes";
import { handleServiceResponse } from "@/common/utils/httpHandler";
import { BadRequestError } from "@/common/handler/error.response";

export default class ChecklistItemController {
    constructor(
        private readonly checklistItemService: ChecklistItemService
    ) { }

    renameChecklistItem = async (req: Request, res: Response) => {
        const itemId = req.params.itemId || req.params.id;
        if (!itemId) {
            throw new BadRequestError('Checklist item ID is required');
        }
        const updateData: UpdateContentChecklistItemSchema = req.body;
        const updatedItem = await this.checklistItemService.renameChecklistItem(itemId, updateData);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Checklist item renamed successfully',
            updatedItem,
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }

    updateChecklistItemStatus = async (req: Request, res: Response) => {
        const itemId = req.params.itemId || req.params.id;
        if (!itemId) {
            throw new BadRequestError('Checklist item ID is required');
        }
        const { isCompleted }: UpdateStatusChecklistItemSchema = req.body;
        const updatedItem = await this.checklistItemService.updateChecklistItemStatus(itemId, isCompleted);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Checklist item status updated successfully',
            updatedItem,
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }

    deleteChecklistItem = async (req: Request, res: Response) => {
        const itemId = req.params.itemId || req.params.id;
        if (!itemId) {
            throw new BadRequestError('Checklist item ID is required');
        }
        await this.checklistItemService.deleteChecklistItem(itemId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Checklist item deleted successfully',
            null,
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }

    reorderChecklistItem = async (req: Request, res: Response) => {
        const itemId = req.params.itemId || req.params.id;
        if (!itemId) {
            throw new BadRequestError('Checklist item ID is required');
        }
        const reorderData: ReorderChecklistItemSchema = req.body;
        const reorderedItems = await this.checklistItemService.reorderChecklistItem(itemId, reorderData);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Checklist item reordered successfully',
            reorderedItems,
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }
}
