import { BoardResponse, CreateBoardSchema, UpdateBoardSchema, CreateBoardJoinLinkDto, BoardJoinLinkResponse, InviteByEmailDto } from "./schemas";
import { NotFoundError, ConflictRequestError, BadRequestError } from "@/common/handler/error.response";
import { toBoardResponse } from "./mapper/board.mapper";
import { toBoardJoinLinkResponse } from "./mapper/board-join-link.mapper";
import { IBoardRepository } from "./repositories/board.repository.interface";
import { IWorkspaceRepository } from "../workspace/repositories/workspace.repository.interface";
import { IBoardJoinLinkRepository } from "./repositories/board-join-link.repository.interface";
import { IBoardMemberRepository } from "./repositories/board-member.repository.interface";
import { IRoleRepository } from "../role/repositories/role.repository.interface";
import { IUserRepository } from "../user/repositories/user.repository.interface";
import { BoardVisibility } from '@/common/entities/board.entity';
import { BoardJoinLink } from "@/common/entities/board-join-link.entity";
import { RoleScope } from "@/common/entities/role.entity";
import { nanoid } from "nanoid";
import { EmailService } from "@/common/utils/mailService";
import { redisStream } from "@/config/redis.config";
import { EMAIL_STREAM } from "@/common/constants/redis";

export default class BoardService {
    private emailService: EmailService;

    constructor(
        private boardRepository: IBoardRepository,
        private workspaceRepository: IWorkspaceRepository,
        private boardJoinLinkRepository: IBoardJoinLinkRepository,
        private boardMemberRepository: IBoardMemberRepository,
        private roleRepository: IRoleRepository,
        private userRepository: IUserRepository,
    ) {
        this.emailService = new EmailService();
    }
    getAllBoardFromWorkspace = async (workspaceId: string, userId: string): Promise<BoardResponse[]> => {
        const boards = await this.boardRepository.findBoardsByWorkspaceId(workspaceId, userId);
        return boards.map(toBoardResponse);
    }
    getBoardById = async (boardId: string): Promise<BoardResponse> => {
        const board = await this.boardRepository.findById(boardId);
        if (!board) {
            throw new NotFoundError(`Board with ID ${boardId} not found`);
        }
        return toBoardResponse(board);
    }
    createBoard = async (workspaceId: string, data: CreateBoardSchema, creatorId: string): Promise<BoardResponse> => {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new NotFoundError(`Workspace with ID ${workspaceId} not found`);
        }
        const existingBoard = await this.boardRepository.findByTitleAndWorkspaceId(data.title, workspaceId);
        if (existingBoard) {
            throw new ConflictRequestError('A board with the same title already exists in this workspace');
        }
        const board = await this.boardRepository.create({
            title: data.title,
            description: data.description ?? '',
            coverUrl: data.coverUrl ?? '',
            visibility: data.visibility,
            workspaceId,
            ownerId: creatorId,
            createdBy: creatorId
        });
        const ownerRole = await this.roleRepository.findByName('board_owner', RoleScope.BOARD);
        if (!ownerRole) {
            throw new NotFoundError('Board owner role not found');
        }
        await this.boardMemberRepository.create({
            boardId: board.id,
            userId: creatorId,
            roleId: ownerRole.id,
        });
        return toBoardResponse(board);
    }
    updateBoard = async (id: string, data: UpdateBoardSchema): Promise<BoardResponse> => {
        const board = await this.boardRepository.findById(id);
        if (!board) {
            throw new NotFoundError(`Board with ID ${id} not found`);
        }
        if (data.visibility === BoardVisibility.PUBLIC) {
            const workspace = await this.workspaceRepository.findById(board.workspaceId);
            if (!workspace) {
                throw new NotFoundError(`Workspace with ID ${board.workspaceId} not found`);
            }
            if (!workspace.visibility) {
                throw new ConflictRequestError('Workspace does not allow public boards');
            }
        }
        board.title = data.title ?? board.title;
        board.description = data.description ?? board.description;
        board.coverUrl = data.coverUrl ?? board.coverUrl;
        board.visibility = data.visibility ?? board.visibility;
        await this.boardRepository.update(board.id, board);
        return toBoardResponse(board);
    }
    delete = async (id: string): Promise<any> => {
        return await this.boardRepository.delete(id);
    }
    reopen = async (id: string): Promise<any> => {
        return await this.boardRepository.reopen(id);
    }
    deletePermanent = async (id: string): Promise<any> => {
        return await this.boardRepository.deletePermanent(id);
    }
    changeOwner = async (id: string, ownerId: string): Promise<BoardResponse> => {
        const board = await this.boardRepository.changeOwner(id, ownerId);
        return toBoardResponse(board);
    }
    // get board with visibility is public
    getAllPublicBoards = async (): Promise<BoardResponse[]> => {
        const boards = await this.boardRepository.findPublicBoards();
        if (!boards.length) {
            throw new NotFoundError('No public boards found');
        }
        return boards.map(toBoardResponse)
    }
    getPublicBoardById = async (id: string): Promise<BoardResponse> => {
        const board = await this.boardRepository.findPublicBoardById(id);
        if (!board) {
            throw new NotFoundError(`Board with ID ${id} not found`);
        }
        return toBoardResponse(board);
    }

    // Board invite methods
    createBoardJoinLink = async (
        boardId: string,
        userId: string,
        data: CreateBoardJoinLinkDto
    ): Promise<BoardJoinLinkResponse> => {
        const board = await this.boardRepository.findById(boardId);
        if (!board) {
            throw new NotFoundError('Board not found');
        }

        const token = nanoid(10);

        // Calculate expiration date if expiresIn is provided
        let expiresAt = new Date();
        if (data.expiresIn) {
            expiresAt.setDate(expiresAt.getDate() + data.expiresIn);
        }

        const joinLink = await this.boardJoinLinkRepository.create({
            boardId,
            token,
            createdBy: userId,
            expiresAt: expiresAt as any,
            maxUses: data.maxUses !== undefined ? data.maxUses : null,
            usedCount: 0,
            isActive: true,
        } as any);

        return toBoardJoinLinkResponse(joinLink);
    }

    joinBoardByLink = async (token: string, userId: string): Promise<{ message: string }> => {
        const joinLink = await this.boardJoinLinkRepository.findByToken(token);
        if (!joinLink) {
            throw new NotFoundError('Join link not found or inactive');
        }

        await this.validateJoinLink(joinLink);

        const isMember = await this.boardMemberRepository.findByBoardAndUserId(joinLink.boardId, userId);
        if (isMember) {
            throw new ConflictRequestError('User is already a member of the board');
        }

        const memberRole = await this.roleRepository.findByName('board_member', RoleScope.BOARD);
        if (!memberRole) {
            throw new NotFoundError('Board member role not found');
        }

        await this.boardMemberRepository.create({
            boardId: joinLink.boardId,
            userId,
            roleId: memberRole.id,
        });

        await this.boardJoinLinkRepository.incrementUsedCount(joinLink.id);

        if (joinLink.maxUses && joinLink.usedCount + 1 >= joinLink.maxUses) {
            joinLink.isActive = false;
            await this.boardJoinLinkRepository.save(joinLink);
        }

        return {
            message: 'Successfully joined the board',
        }
    }

    getBoardJoinLinks = async (boardId: string): Promise<BoardJoinLinkResponse[]> => {
        const joinLinks = await this.boardJoinLinkRepository.findByBoardId(boardId);
        return joinLinks.map(toBoardJoinLinkResponse);
    }

    revokeBoardJoinLink = async (joinLinkId: string, boardId: string): Promise<{ message: string }> => {
        const joinLink = await this.boardJoinLinkRepository.findById(joinLinkId);
        if (!joinLink) {
            throw new NotFoundError('Join link not found');
        }
        if (joinLink.boardId !== boardId) {
            throw new BadRequestError('Join link does not belong to the specified board');
        }

        joinLink.isActive = false;
        await this.boardJoinLinkRepository.save(joinLink);

        return { message: 'Join link revoked successfully' }
    }

    deleteBoardJoinLink = async (joinLinkId: string, boardId: string): Promise<{ message: string }> => {
        const joinLink = await this.boardJoinLinkRepository.findById(joinLinkId);
        if (!joinLink) {
            throw new NotFoundError('Join link not found');
        }
        if (joinLink.boardId !== boardId) {
            throw new BadRequestError('Join link does not belong to the specified board');
        }

        await this.boardJoinLinkRepository.delete(joinLinkId);

        return { message: 'Join link deleted successfully' }
    }

    inviteByEmail = async (boardId: string, data: InviteByEmailDto, inviterId: string): Promise<{
        message: string
    }> => {
        const board = await this.boardRepository.findById(boardId);
        if (!board) {
            throw new NotFoundError('Board not found');
        }

        const invitedUser = await this.userRepository.findByEmail(data.email);
        if (invitedUser) {
            const existingMember = await this.boardMemberRepository.findByBoardAndUserId(boardId, invitedUser.id);
            if (existingMember) {
                throw new ConflictRequestError('User is already a member of this board');
            }
        }

        let roleId = data.roleId;
        if (!roleId) {
            const boardMemberRole = await this.roleRepository.findByName('board_member', RoleScope.BOARD);
            if (!boardMemberRole) {
                throw new NotFoundError('Default board_member role not found');
            }
            roleId = boardMemberRole.id;
        }

        const inviter = await this.userRepository.findById(inviterId);
        const inviterName = inviter?.fullname || inviter?.username || 'A team member';

        // create invite link
        const inviteLink = await this.createBoardJoinLink(
            boardId,
            inviterId,
            {
                expiresIn: 7,
                maxUses: 1,
            }
        );
        const mailPayload = {
            title: board.title,
            inviterName,
            inviteLink: inviteLink.fullLink,
            expiresAt: inviteLink.expiresAt,
        }
        await redisStream.xadd(EMAIL_STREAM, '*', 'type', 'board_invitation', 'email', data.email, 'mailPayload', JSON.stringify(mailPayload));
        return {
            message: 'Invitation sent successfully'
        }
    }

    getBoardMembers = async (boardId: string): Promise<any[]> => {
        const board = await this.boardRepository.findById(boardId);
        if (!board) {
            throw new NotFoundError('Board not found');
        }

        const members = await this.boardMemberRepository.findByBoardId(boardId);
        const membersWithDetails = await Promise.all(
            members.map(async (member) => {
                const user = await this.userRepository.findById(member.userId);
                const role = await this.roleRepository.findById(member.roleId);

                return {
                    id: member.id,
                    userId: member.userId,
                    username: user?.username,
                    fullname: user?.fullname,
                    email: user?.email,
                    avatarUrl: user?.avatarUrl,
                    roleId: member.roleId,
                    roleName: role?.name,
                    joinedAt: member.created_at,
                };
            })
        );

        return membersWithDetails;
    }

    private async validateJoinLink(joinLink: BoardJoinLink): Promise<void> {
        if (!joinLink.isActive) {
            throw new BadRequestError('Join link is inactive');
        }
        if (joinLink.expiresAt && new Date() > joinLink.expiresAt) {
            throw new BadRequestError('Join link has expired');
        }
        if (joinLink.maxUses && joinLink.usedCount >= joinLink.maxUses) {
            throw new BadRequestError('Join link has reached its maximum uses');
        }
    }
}
