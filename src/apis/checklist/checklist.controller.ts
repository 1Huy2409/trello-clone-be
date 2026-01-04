import { Request, Response } from "express";
import ChecklistService from "./checklist.service";
import { ReorderChecklistSchema, UpdateChecklistSchema } from "./schemas";
import { BadRequestError } from "@/common/handler/error.response";
import { ResponseStatus, ServiceResponse } from "@/common/models/service.response";
import { StatusCodes } from "http-status-codes";
import { handleServiceResponse } from "@/common/utils/httpHandler";

export default class ChecklistController {
    constructor(
        private checklistService: ChecklistService
    ) {}

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
}