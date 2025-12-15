import { UpdateWorkspaceMemberRoleSchema } from './schemas/workspace-member/workspace-member.request.schema';
import { WorkspaceStatus } from "@/common/entities/workspace.entity";
import { ConflictRequestError, NotFoundError } from "@/common/handler/error.response";
import { CreateWorkspaceSchema, UpdateWorkspaceSchema, WorkspaceMemberResponse, WorkspaceResponse } from "./schemas";
import { toWorkspaceResponse } from "./mapper/workspace.mapper";
import { WorkspaceMember } from "@/common/entities/workspace-member.entity";
import { BoardVisibility, BoardStatus } from '@/common/entities/board.entity';
import { BoardResponse, CreateBoardSchema } from '../board/schemas';
import { toBoardResponse } from '../board/mapper/board.mapper';
import { RoleScope } from '@/common/entities/role.entity';
import { IWorkspaceRepository } from './repositories/workspace.repository.interface';
import { IWorkspaceMemberRepository } from './repositories/workspace-member.repository.interface';
import { IBoardRepository } from '../board/repositories/board.repository.interface';
import { IRoleRepository } from '../role/repositories/role.repository.interface';
import { toWorkspaceMemberResponse } from './mapper/workspace-member.mapper';
import { RbacService } from '@/common/rbac/rbac.service';

export default class WorkspaceService {
    constructor(
        private workspaceRepository: IWorkspaceRepository,
        private workspaceMemberRespository: IWorkspaceMemberRepository,
        private boardRepository: IBoardRepository,
        private roleRepository: IRoleRepository,
        private rbacService: RbacService
    ) { }
    // base crud for workspace
    findAll = async (userId: string): Promise<WorkspaceResponse[]> => {
        const workspaces = await this.workspaceRepository.findByUserId(userId);
        return workspaces.map(toWorkspaceResponse);
    }
    findAllArchived = async (userId: string): Promise<WorkspaceResponse[]> => {
        const archivedWorkspaces = await this.workspaceRepository.findArchivedByOwnerId(userId);
        return archivedWorkspaces.map(toWorkspaceResponse);
    }
    findById = async (id: string): Promise<WorkspaceResponse> => {
        const workspace = await this.workspaceRepository.findById(id);
        if (!workspace) {
            throw new NotFoundError(`Workspace with id ${id} not found`);
        }
        return toWorkspaceResponse(workspace);
    }
    create = async (data: CreateWorkspaceSchema, ownerId: string): Promise<WorkspaceResponse> => {
        const { title, description, visibility } = data;

        const existingWorkspace = await this.workspaceRepository.findByName(title, ownerId);
        if (existingWorkspace) {
            throw new ConflictRequestError('Workspace with this title already exists');
        }
        const newWorkspace = await this.workspaceRepository.create({
            title,
            description: description ?? '',
            visibility,
            ownerId
        });

        const ownerRole = await this.roleRepository.findByName('workspace_owner', RoleScope.WORKSPACE);
        if (!ownerRole) {
            throw new NotFoundError('Workspace owner role not found!');
        }
        await this.workspaceMemberRespository.create({
            role: ownerRole,
            userId: ownerId,
            workspaceId: newWorkspace.id
        });
        return toWorkspaceResponse(newWorkspace);
    }
    update = async (data: UpdateWorkspaceSchema, id: string): Promise<{ message: string, workspace: WorkspaceResponse }> => {
        const { title, ...rest } = data;
        const workspace = await this.workspaceRepository.findById(id);
        if (!workspace) {
            throw new NotFoundError(`Workspace with id ${id} not found`);
        }
        // set flag handle isChange?
        const isChange = ((title && title !== workspace.title) || (rest.description && rest.description !== workspace.description) || (rest.visibility && rest.visibility !== workspace.visibility));
        const message: string = isChange ? 'Workspace updated successfully' : 'No changes detected';
        if (!isChange) {
            return { message, workspace: toWorkspaceResponse(workspace) };
        }
        if (title && title !== workspace.title) {
            const existingWorkspace = await this.workspaceRepository.findByName(title, workspace.ownerId);
            if (existingWorkspace) {
                throw new ConflictRequestError('Workspace with this title already exists');
            }
            workspace.title = title;
        }
        workspace.description = rest.description ?? workspace.description;
        workspace.visibility = rest.visibility ?? workspace.visibility;
        await this.workspaceRepository.update(id, workspace);
        return { message, workspace: toWorkspaceResponse(workspace) };
    }
    archive = async (id: string): Promise<{ message: string, workspace: WorkspaceResponse }> => {
        const workspace = await this.workspaceRepository.findById(id);
        if (!workspace) {
            throw new NotFoundError(`Workspace with id ${id} not found`);
        }
        if (workspace.status === WorkspaceStatus.ARCHIVED) {
            return {
                message: 'No changes detected',
                workspace: toWorkspaceResponse(workspace)
            }
        }
        workspace.status = WorkspaceStatus.ARCHIVED;
        await this.workspaceRepository.update(id, workspace);
        return {
            message: 'Workspace archived successfully',
            workspace: toWorkspaceResponse(workspace)
        }
    }

    reopen = async (id: string): Promise<{ message: string, workspace: WorkspaceResponse }> => {
        const workspace = await this.workspaceRepository.findById(id);
        if (!workspace) {
            throw new NotFoundError(`Workspace with id ${id} not found`);
        }
        if (workspace.status === WorkspaceStatus.ACTIVE) {
            return {
                message: 'No changes detected',
                workspace: toWorkspaceResponse(workspace)
            }
        }
        workspace.status = WorkspaceStatus.ACTIVE;
        await this.workspaceRepository.update(id, workspace);
        return {
            message: 'Workspace reopened successfully',
            workspace: toWorkspaceResponse(workspace)
        }
    }
    delete = async (id: string, ownerId: string): Promise<{ message: string }> => {
        const workspace = await this.workspaceRepository.findOneByOwnerId(id, ownerId);
        if (!workspace) {
            throw new NotFoundError(`Workspace with id ${id} not found or you are not the owner`);
        }
        // update status
        workspace.isActive = false;
        workspace.boards.forEach(board => {
            board.isActive = false;
            board.status = BoardStatus.ARCHIVED;
        });
        await this.workspaceRepository.update(id, workspace);
        await this.rbacService.onWorkspaceDeleted(id);
        return {
            message: 'Delete workspace successfully!'
        }
    }

    getWorkspaceMembers = async (id: string): Promise<WorkspaceMemberResponse[]> => {
        const workspaceMember = await this.workspaceMemberRespository.findByWorkspaceId(id);
        if (!workspaceMember.length) {
            throw new NotFoundError(`No members found in workspace with id ${id}`);
        }
        return workspaceMember.map(toWorkspaceMemberResponse);
    }

    updateMemberRole = async (workspaceId: string, userId: string, data: UpdateWorkspaceMemberRoleSchema, currentUserId: string): Promise<{ message: string, member: WorkspaceMemberResponse }> => {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new NotFoundError(`Workspace with id ${workspaceId} not found`);
        }
        if (currentUserId === userId) {
            throw new ConflictRequestError('Cannot change role of the workspace yourself');
        }
        const existingMember = await this.workspaceMemberRespository.findByWorkspaceAndUserId(workspaceId, userId);
        if (!existingMember) {
            throw new NotFoundError('User is not a member of this workspace');
        }

        const isChange = existingMember.roleId !== data.roleId;
        if (!isChange) {
            return {
                message: 'No changes detected',
                member: toWorkspaceMemberResponse(existingMember)
            }
        }
        const role = await this.roleRepository.findById(data.roleId);
        if (!role || role.scope !== RoleScope.WORKSPACE) {
            throw new NotFoundError('Invalid role ID or role is not for workspace');
        }
        console.log("Role to assign:", role.name);
        if (role.name === 'workspace_owner') {
            throw new ConflictRequestError('Cannot assign workspace owner role to another member');
        }
        existingMember.roleId = data.roleId;
        existingMember.role = role;
        const updatedMember: WorkspaceMember = await this.workspaceMemberRespository.update(existingMember.id, existingMember);
        await this.rbacService.onWorkspaceMemberRoleChanged(workspaceId, userId);
        return {
            message: 'Update member role successfully!',
            member: toWorkspaceMemberResponse(updatedMember)
        }
    }
    removeMemberFromWorkspace = async (workspaceId: string, userId: string): Promise<{ message: string }> => {
        const workspace = await this.workspaceRepository.findById(workspaceId);
        if (!workspace) {
            throw new NotFoundError(`Workspace with id ${workspaceId} not found`);
        }
        if (workspace.ownerId === userId) {
            throw new ConflictRequestError('Cannot remove the owner from the workspace');
        }
        const existingMember = await this.workspaceMemberRespository.findByWorkspaceAndUserId(workspaceId, userId);
        if (!existingMember) {
            throw new NotFoundError('User is not a member of this workspace');
        }
        await this.workspaceMemberRespository.delete(existingMember);
        await this.rbacService.onUserRemovedFromWorkspace(userId, workspaceId);
        return {
            message: 'Remove member from workspace successfully!'
        }
    }
}