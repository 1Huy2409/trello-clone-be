import { Request, Response } from "express";
import BoardService from "./board.service";
import { ResponseStatus, ServiceResponse } from "@/common/models/service.response";
import { StatusCodes } from "http-status-codes";
import { handleServiceResponse } from "@/common/utils/httpHandler";
import { AuthFailureError, BadRequestError } from "@/common/handler/error.response";
import { CreateBoardWithWorkspaceSchema, UpdateBoardSchema, CreateBoardJoinLinkDto, JoinBoardByLinkDto, InviteByEmailDto } from "./schemas";
import { CreateListSchema } from "../list/schemas";
import ListService from "../list/list.service";

export default class BoardController {
    constructor(
        private boardService: BoardService,
        private listService: ListService
    ) { }
    getBoardById = async (req: Request, res: Response) => {
        const { boardId } = req.params;
        if (!boardId) {
            throw new BadRequestError('Board id is required');
        }
        const board = await this.boardService.getBoardById(boardId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get board by ID successfully',
            board,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    createBoard = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AuthFailureError('Authentication failure');
        }
        const data: CreateBoardWithWorkspaceSchema = req.body;
        if (!data.workspaceId) {
            throw new BadRequestError('Workspace id is required');
        }
        const board = await this.boardService.createBoard(data.workspaceId, data, userId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Create board successfully',
            board,
            StatusCodes.CREATED
        )
        return handleServiceResponse(serviceResponse, res);
    }
    getAllPublicBoards = async (req: Request, res: Response) => {
        const boards = await this.boardService.getAllPublicBoards();
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get all public boards successfully',
            boards,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    getPublicBoardById = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError('Board id is required')
        }
        const board = await this.boardService.getPublicBoardById(id);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get public board by ID successfully',
            board,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    deleteBoard = async (req: Request, res: Response) => {
        const { boardId } = req.params;
        if (!boardId) {
            throw new BadRequestError('Board id is required')
        }
        await this.boardService.delete(boardId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Delete board successfully',
            null,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }

    reopenBoard = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new BadRequestError('Board id is required');
        await this.boardService.reopen(id);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Reopen board successfully',
            null,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }

    deletePermanent = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new BadRequestError('Board id is required');
        await this.boardService.deletePermanent(id);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Board permanently deleted',
            null,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }

    changeOwner = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { ownerId } = req.body as { ownerId?: string };
        if (!id) throw new BadRequestError('Board id is required');
        if (!ownerId) throw new BadRequestError('ownerId is required');
        const updated = await this.boardService.changeOwner(id, ownerId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Board owner updated successfully',
            updated,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }

    updateBoard = async (req: Request, res: Response) => {
        const { boardId } = req.params;
        if (!boardId) {
            throw new BadRequestError(`Board ${boardId} is required`)
        }
        const data: UpdateBoardSchema = req.body;
        const board = await this.boardService.updateBoard(boardId, data);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Update board successfully',
            board,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }

    // Board invite methods
    createBoardJoinLink = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AuthFailureError('Authentication failure');
        }
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError('Board id is required');
        }
        const data: CreateBoardJoinLinkDto = req.body;
        const joinLink = await this.boardService.createBoardJoinLink(id, userId, data);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Board join link created successfully',
            joinLink,
            StatusCodes.CREATED
        )
        return handleServiceResponse(serviceResponse, res);
    }

    joinBoardByLink = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AuthFailureError('Authentication failure');
        }
        const data: JoinBoardByLinkDto = req.body;
        if (!data.token) {
            throw new BadRequestError('Token is required');
        }
        const result = await this.boardService.joinBoardByLink(data.token, userId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            null,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }

    getBoardJoinLinks = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError('Board id is required');
        }
        const joinLinks = await this.boardService.getBoardJoinLinks(id);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get board join links successfully',
            joinLinks,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }

    revokeBoardJoinLink = async (req: Request, res: Response) => {
        const { id, linkId } = req.params;
        if (!id || !linkId) {
            throw new BadRequestError('Board id and link id are required');
        }
        const result = await this.boardService.revokeBoardJoinLink(linkId, id);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            null,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }

    deleteBoardJoinLink = async (req: Request, res: Response) => {
        const { id, linkId } = req.params;
        if (!id || !linkId) {
            throw new BadRequestError('Board id and link id are required');
        }
        const result = await this.boardService.deleteBoardJoinLink(linkId, id);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            null,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }

    inviteByEmail = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new AuthFailureError('Authentication failure');
        }
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError('Board id is required');
        }
        const data: InviteByEmailDto = req.body;
        const result = await this.boardService.inviteByEmail(id, data, userId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            null,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }

    getBoardMembers = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            throw new BadRequestError('Board id is required');
        }
        const members = await this.boardService.getBoardMembers(id);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get board members successfully',
            members,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    // manage lists here
    getListsByBoardId = async (req: Request, res: Response) => {
        const { boardId } = req.params;
        if (!boardId) {
            throw new BadRequestError('Board id is required');
        }
        const lists = await this.listService.getAll(boardId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Get lists by board ID successfully',
            lists,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res);
    }
    createList = async (req: Request, res: Response) => {
        console.log("Controller - createList called");
        const { boardId } = req.params;
        if (!boardId) {
            throw new BadRequestError('Board id is required');
        }
        const data: CreateListSchema = req.body;
        const newList = await this.listService.createList(data, boardId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Create list successfully',
            newList,
            StatusCodes.CREATED
        )
        return handleServiceResponse(serviceResponse, res);
    }
}
