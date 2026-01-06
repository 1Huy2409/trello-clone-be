import { Request, Response } from "express";
import AttachmentService from "./attachment.service";
import { BadRequestError } from "@/common/handler/error.response";
import { ResponseStatus, ServiceResponse } from "@/common/models/service.response";
import { StatusCodes } from "http-status-codes";
import { handleServiceResponse } from "@/common/utils/httpHandler";

export default class AttachmentController {
    constructor(private attachmentService: AttachmentService) { }

    uploadAttachment = async (req: Request, res: Response) => {
        const cardId = req.body.cardId || req.params.cardId;
        const file = req.file;

        if (!cardId) {
            throw new BadRequestError('Card ID is required');
        }
        if (!file) {
            throw new BadRequestError('File is required');
        }

        const attachment = await this.attachmentService.createAttachment(cardId, file);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Upload attachment successfully',
            attachment,
            StatusCodes.CREATED
        );
        return handleServiceResponse(serviceResponse, res);
    }

    deleteAttachment = async (req: Request, res: Response) => {
        const attachmentId = req.params.id;
        if (!attachmentId) {
            throw new BadRequestError('Attachment ID is required');
        }

        await this.attachmentService.deleteAttachment(attachmentId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Delete attachment successfully',
            null,
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }

    getAttachments = async (req: Request, res: Response) => {
        const cardId = req.params.cardId;
        if (!cardId) {
            throw new BadRequestError('Card ID is required');
        }

        const attachments = await this.attachmentService.getAttachmentsByCardId(cardId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get attachments successfully',
            attachments,
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }
}
