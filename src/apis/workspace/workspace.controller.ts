import { Request, Response } from "express";
import WorkspaceService from "./workspace.service";
import { ResponseStatus, ServiceResponse } from "@/common/models/service.response";
import { StatusCodes } from "http-status-codes";
import { handleServiceResponse } from "@/common/utils/httpHandler";
import { AuthFailureError, BadRequestError } from "@/common/handler/error.response";
import { AddWorkspaceMemberSchema, CreateWorkspaceSchema, UpdateWorkspaceMemberRoleSchema, UpdateWorkspaceSchema } from "./schemas";
import { CreateBoardSchema, UpdateBoardSchema } from "../board/schemas";
import { WorkspaceRoleService } from "./workspace-role.service";
import { CreateWorkspaceRoleDto, UpdateWorkspaceRoleDto } from "./dto/workspace-role.dto";
import { toWorkspaceRoleResponse } from "./mapper/workspace-role.mapper";
import BoardService from "../board/board.service";

export default class WorkspaceController {
    constructor(
        private workspaceService: WorkspaceService,
        private boardService: BoardService,
        private workspaceRoleService: WorkspaceRoleService
    ) { }

    findAll = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AuthFailureError('Authentication failure');
        }
        const workspaces = await this.workspaceService.findAll(userId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get all workspaces successfully',
            workspaces,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    findArchiveWorkspaces = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AuthFailureError('Authentication failure');
        }
        const workspaces = await this.workspaceService.findAllArchived(userId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get all archived workspaces successfully',
            workspaces,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    findById = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError('Workspace id is required');
        }
        const workspace = await this.workspaceService.findById(id);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get workspace by ID successfully',
            workspace,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    create = async (req: Request, res: Response) => {
        const data: CreateWorkspaceSchema = req.body;
        const ownerId = req.user?.id;
        if (!ownerId) {
            throw new AuthFailureError('Authentication failure');
        }
        const newWorkspace = await this.workspaceService.create(data, ownerId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Create workspace successfully',
            newWorkspace,
            StatusCodes.CREATED
        )
        return handleServiceResponse(serviceResponse, res);
    }
    update = async (req: Request, res: Response) => {
        const { id } = req.params;
        const data: UpdateWorkspaceSchema = req.body;
        if (!id) {
            throw new BadRequestError('Workspace id is required');
        }
        const result = await this.workspaceService.update(data, id);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            result.workspace,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    archive = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError('Workspace id is required');
        }
        const result = await this.workspaceService.archive(id);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            result.workspace,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    reopen = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError('Workspace id is required');
        }
        const result = await this.workspaceService.reopen(id);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            result.workspace,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }

    delete = async (req: Request, res: Response) => {
        const { id } = req.params;
        const ownerId = req.user?.id;
        if (!id) {
            throw new BadRequestError('Workspace id is required');
        }
        const message = await this.workspaceService.delete(id, ownerId!);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Delete workspace successfully',
            message,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    getWorkspaceMembers = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError('Workspace id is required');
        }
        const members = await this.workspaceService.getWorkspaceMembers(id);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get workspace members successfully',
            members,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    updateMemberRole = async (req: Request, res: Response) => {
        const user = req.user;
        if (!user) {
            throw new AuthFailureError('Authentication failure');
        }
        const { id, userId } = req.params;
        if (!id || !userId) {
            throw new BadRequestError('Workspace id and User id are required');
        }
        const data: UpdateWorkspaceMemberRoleSchema = req.body;
        const result = await this.workspaceService.updateMemberRole(id, userId, data, user.id);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            result.member,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    removeMemberFromWorkspace = async (req: Request, res: Response) => {
        const { id, userId } = req.params;
        if (!id || !userId) {
            throw new BadRequestError('Workspace id and User id are required');
        }
        const message = await this.workspaceService.removeMemberFromWorkspace(id, userId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Remove member from workspace successfully',
            message,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    getAllBoardFromWorkspace = async (req: Request, res: Response) => {
        const { id } = req.params;
        console.log("Workspace ID:", id);
        if (!id) {
            throw new BadRequestError('Workspace id is required');
        }
        const boards = await this.boardService.getAllBoardFromWorkspace(id);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get all boards in workspace successfully',
            boards,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    addBoardToWorkspace = async (req: Request, res: Response) => {
        const { id } = req.params;
        const boardData: CreateBoardSchema = req.body;
        if (!id) {
            throw new BadRequestError('Workspace id is required');
        }
        const ownerId = req.user?.id;
        if (!ownerId) throw new AuthFailureError('Authentication failure');
        const newBoard = await this.boardService.createBoard(id, boardData, ownerId)
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Add board into workspace successfully',
            newBoard,
            StatusCodes.CREATED
        )
        return handleServiceResponse(serviceResponse, res);
    }
    // manage workspace roles
    getWorkspaceRoles = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError('Workspace id is required');
        }
        const roles = await this.workspaceRoleService.getRoles(id);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get workspace roles successfully',
            roles.map(toWorkspaceRoleResponse),
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    addWorkspaceRole = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError('Workspace id is required');
        }
        const dto: CreateWorkspaceRoleDto = req.body;
        const newRole = await this.workspaceRoleService.createRole(id, dto);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Create workspace role successfully',
            toWorkspaceRoleResponse(newRole),
            StatusCodes.CREATED
        )
        return handleServiceResponse(serviceResponse, res);
    }
    updateWorkspaceRole = async (req: Request, res: Response) => {
        const { id, roleId } = req.params;
        if (!id || !roleId) {
            throw new BadRequestError('Workspace id and Role id are required');
        }
        const dto: UpdateWorkspaceRoleDto = req.body;
        const updatedRole = await this.workspaceRoleService.updateRole(id, roleId, dto);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Update workspace role successfully',
            toWorkspaceRoleResponse(updatedRole),
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    deleteWorkspaceRole = async (req: Request, res: Response) => {
        const { id, roleId } = req.params;
        if (!id || !roleId) {
            throw new BadRequestError('Workspace id and Role id are required');
        }
        const message = await this.workspaceRoleService.deleteRole(id, roleId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Delete workspace role successfully',
            message,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
}
