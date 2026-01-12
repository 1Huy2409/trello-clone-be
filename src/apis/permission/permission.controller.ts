import { Request, Response } from "express";
import { PermissionService } from "./permission.service";
import { ServiceResponse, ResponseStatus } from "@/common/models/service.response";
import { StatusCodes } from "http-status-codes";
import { handleServiceResponse } from "@/common/utils/httpHandler";

export class PermissionController {
    constructor(
        private readonly permissionService: PermissionService
    ) { }

    findAll = async (req: Request, res: Response) => {
        const permissions = await this.permissionService.findAll();
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get all permissions successfully',
            permissions,
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }
}
