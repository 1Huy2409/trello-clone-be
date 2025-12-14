import { Request, Response } from "express";
import ListService from "./list.service";
import { UpdateListSchema } from "./schemas";
import { ResponseStatus, ServiceResponse } from "@/common/models/service.response";
import { BadRequestError } from "@/common/handler/error.response";
import { handleServiceResponse } from "@/common/utils/httpHandler";
import { StatusCodes } from "http-status-codes/build/cjs/status-codes";

export default class ListController {
    constructor(private listService: ListService) { }

    editListName = async (req: Request, res: Response) => {
        const { listId } = req.params;
        if (!listId) {
            throw new BadRequestError('List id is required');
        }
        const updateData: UpdateListSchema = req.body;
        const updatedList = await this.listService.editListName(listId, updateData);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Update list name successfully',
            updatedList,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    archiveList = async (req: Request, res: Response) => {
        const { listId } = req.params;
        if (!listId) {
            throw new BadRequestError('List id is required');
        }
        const archivedList = await this.listService.archiveList(listId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Archive list successfully',
            archivedList,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    reopenList = async (req: Request, res: Response) => {
        const { listId } = req.params;
        if (!listId) {
            throw new BadRequestError('List id is required');
        }
        const reopenedList = await this.listService.reopenList(listId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Reopen list successfully',
            reopenedList,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    reorderList = async (req: Request, res: Response) => {
        const data = req.body;
        const reorderedList = await this.listService.reorderList(data);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Reorder list successfully',
            reorderedList,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    moveList = async (req: Request, res: Response) => {
        const data = req.body;
        const movedList = await this.listService.moveList(data);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Move list successfully',
            movedList,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    copyList = async (req: Request, res: Response) => {
        const data = req.body;
        const copiedList = await this.listService.copyList(data);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Copy list successfully',
            copiedList,
            StatusCodes.CREATED
        )
        return handleServiceResponse(serviceResponse, res);
    }
}