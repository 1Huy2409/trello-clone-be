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
    getAllBoardFromWorkspace = async (workspaceId: string): Promise<BoardResponse[]> => {
        const boards = await this.boardRepository.findBoardsByWorkspaceId(workspaceId);
        return boards.map(toBoardResponse);
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
        message: string;
        userExists?: boolean;
        userId?: string;
        inviteLink?: string;
        expiresAt?: Date | null;
        emailSent?: boolean;
        error?: string;
    }> => {
        const board = await this.boardRepository.findById(boardId);
        if (!board) {
            throw new NotFoundError('Board not found');
        }

        // Find user by email
        const invitedUser = await this.userRepository.findByEmail(data.email);

        // Get roleId - if not provided, use board_member role
        let roleId = data.roleId;
        if (!roleId) {
            const boardMemberRole = await this.roleRepository.findByName('board_member', RoleScope.BOARD);
            if (!boardMemberRole) {
                throw new NotFoundError('Default board_member role not found');
            }
            roleId = boardMemberRole.id;
        }

        // Get inviter info for email
        const inviter = await this.userRepository.findById(inviterId);
        const inviterName = inviter?.fullname || inviter?.username || 'A team member';

        // If user exists, add them to the board directly
        if (invitedUser) {
            // Check if already a member
            const existingMember = await this.boardMemberRepository.findByBoardAndUserId(boardId, invitedUser.id);
            if (existingMember) {
                throw new ConflictRequestError('User is already a member of this board');
            }

            // Add user to board
            await this.boardMemberRepository.create({
                boardId,
                userId: invitedUser.id,
                roleId,
            });

            // Send notification email for existing user
            try {
                const boardLink = `${process.env.FRONTEND_BASE_URL || 'http://localhost:3000'}/boards/${boardId}`;
                await this.emailService.sendBoardInvitation(
                    data.email,
                    board.title,
                    inviterName,
                    boardLink,
                    null // No expiration for existing users
                );

                return {
                    message: 'User added to board successfully and notification email sent',
                    userExists: true,
                    userId: invitedUser.id,
                    emailSent: true,
                };
            } catch (error) {
                // User was added but email failed
                return {
                    message: 'User added to board successfully but email notification failed',
                    userExists: true,
                    userId: invitedUser.id,
                    emailSent: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
            }
        }

        // User doesn't exist - create invite link and send email
        const inviteLink = await this.createBoardJoinLink(
            boardId,
            inviterId,
            {
                expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days for email invites
                maxUses: 1, // One-time use for email invites
            }
        );

        // Send invitation email
        try {
            await this.emailService.sendBoardInvitation(
                data.email,
                board.title,
                inviterName,
                inviteLink.fullLink,
                inviteLink.expiresAt
            );

            return {
                message: 'Invitation email sent successfully',
                userExists: false,
                inviteLink: inviteLink.fullLink,
                expiresAt: inviteLink.expiresAt,
                emailSent: true,
            };
        } catch (error) {
            // If email fails, still return the invite link
            return {
                message: 'Invite link created but email sending failed. Please share the link manually.',
                userExists: false,
                inviteLink: inviteLink.fullLink,
                expiresAt: inviteLink.expiresAt,
                emailSent: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    getBoardMembers = async (boardId: string): Promise<any[]> => {
        const board = await this.boardRepository.findById(boardId);
        if (!board) {
            throw new NotFoundError('Board not found');
        }

        const members = await this.boardMemberRepository.findByBoardId(boardId);

        // Populate user and role info
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

        // Only check expiration if expiresAt is set
        if (joinLink.expiresAt && new Date() > joinLink.expiresAt) {
            throw new BadRequestError('Join link has expired');
        }

        // Only check max uses if it's set
        if (joinLink.maxUses && joinLink.usedCount >= joinLink.maxUses) {
            throw new BadRequestError('Join link has reached its maximum uses');
        }
    }
}
