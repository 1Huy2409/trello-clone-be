import { Request, Response } from "express";
import ChecklistService from "./checklist.service";
import ChecklistItemService from "@/apis/checklist-item/checklist-item.service";
import { CopyChecklistSchema, ReorderChecklistSchema, UpdateChecklistSchema } from "./schemas";
import { CreateChecklistItemSchema } from "@/apis/checklist-item/schemas";
import { BadRequestError } from "@/common/handler/error.response";
import { ResponseStatus, ServiceResponse } from "@/common/models/service.response";
import { StatusCodes } from "http-status-codes";
import { handleServiceResponse } from "@/common/utils/httpHandler";

export default class ChecklistController {
    constructor(
        private checklistService: ChecklistService,
        private checklistItemService: ChecklistItemService
    ) { }
    getChecklistItemsByChecklistId = async (req: Request, res: Response) => {
        const checklistId = req.params.checklistId || req.params.id;
        if (!checklistId) {
            throw new BadRequestError('Checklist ID is required');
        }
        const checklistItems = await this.checklistItemService.getAllChecklistItems(checklistId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get checklist items by checklist ID successfully',
            checklistItems,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    createChecklistItem = async (req: Request, res: Response) => {
        const checklistId = req.params.checklistId || req.params.id;
        if (!checklistId) {
            throw new BadRequestError('Checklist ID is required');
        }
        const createData: CreateChecklistItemSchema = req.body;
        const newItem = await this.checklistItemService.createChecklistItem(checklistId, createData);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Checklist item created successfully',
            newItem,
            StatusCodes.CREATED
        );
        return handleServiceResponse(serviceResponse, res);
    }

    updateChecklist = async (req: Request, res: Response) => {
        const checklistId = req.params.checklistId || req.params.id;
        if (!checklistId) {
            throw new BadRequestError('Checklist ID is required');
        }
        const updateData: UpdateChecklistSchema = req.body;
        const updatedChecklist = await this.checklistService.updateChecklist(checklistId, updateData);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Checklist updated successfully',
            updatedChecklist,
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }
    deleteChecklist = async (req: Request, res: Response) => {
        const checklistId = req.params.checklistId || req.params.id;
        if (!checklistId) {
            throw new BadRequestError('Checklist ID is required');
        }
        await this.checklistService.deleteChecklist(checklistId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Checklist deleted successfully',
            null,
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }
    reorderChecklist = async (req: Request, res: Response) => {
        const checklistId = req.params.checklistId || req.params.id;
        if (!checklistId) {
            throw new BadRequestError('Checklist ID is required');
        }
        const reorderData: ReorderChecklistSchema = req.body;
        const updatedChecklists = await this.checklistService.reorderChecklist(checklistId, reorderData);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Checklist reordered successfully',
            updatedChecklists,
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }

    copyChecklist = async (req: Request, res: Response) => {
        const checklistId = req.params.checklistId || req.params.id;
        if (!checklistId) {
            throw new BadRequestError('Checklist ID is required');
        }
        const copyData: CopyChecklistSchema = req.body;
        const copiedChecklist = await this.checklistService.copyChecklist(checklistId, copyData);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Checklist copied successfully',
            copiedChecklist,
            StatusCodes.CREATED
        );
        return handleServiceResponse(serviceResponse, res);
    }
}