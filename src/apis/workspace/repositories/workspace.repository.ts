import { Workspace, WorkspaceStatus } from "@/common/entities/workspace.entity";
import { Repository } from "typeorm";
import { IWorkspaceRepository } from "./workspace.repository.interface";
import { NotFoundError } from "@/common/handler/error.response";

export class WorkspaceRepository implements IWorkspaceRepository {
    constructor(
        private readonly workspaceRepository: Repository<Workspace>
    ) { }

    async findAll(): Promise<Workspace[]> {
        return this.workspaceRepository.find({
            where: { isActive: true },
            relations: ['owner'],
        });
    }

    async findByName(name: string, ownerId: string): Promise<Workspace | null> {
        return await this.workspaceRepository.findOne({ where: { title: name, ownerId }, relations: ['owner'] });
    }

    async findByOwnerId(ownerId: string): Promise<Workspace[]> {
        return this.workspaceRepository.find({ where: { ownerId: ownerId, isActive: true }, relations: ['owner'] });
    }
    async findOneByOwnerId(id: string, ownerId: string): Promise<Workspace | null> {
        return this.workspaceRepository.findOne({ where: { id, ownerId, isActive: true }, relations: ['owner', 'workspaceMembers', 'boards', 'workspaceMembers.user', 'workspaceMembers.role'] });
    }

    async findByUserId(userId: string): Promise<Workspace[]> {
        return this.workspaceRepository
            .createQueryBuilder('workspace')
            .innerJoin('workspace.workspaceMembers', 'workspaceMember')
            .leftJoinAndSelect('workspace.owner', 'owner')

            .where('workspaceMember.userId = :userId', { userId })
            .andWhere('workspace.isActive = :isActive', { isActive: true })
            .andWhere('workspace.status = :status', { status: WorkspaceStatus.ACTIVE })
            .orderBy('workspace.created_at', 'DESC')
            .getMany();
    }
    async findArchivedByOwnerId(userId: string): Promise<Workspace[]> {
        return this.workspaceRepository
            .createQueryBuilder('workspace')
            .innerJoin('workspace.workspaceMembers', 'workspaceMember')
            .leftJoinAndSelect('workspace.owner', 'owner')

            .where('workspaceMember.userId = :userId', { userId })
            .andWhere('workspace.isActive = :isActive', { isActive: true })
            .andWhere('workspace.status = :status', { status: WorkspaceStatus.ARCHIVED })
            .orderBy('workspace.created_at', 'DESC')
            .getMany();
    }


    async findById(id: string): Promise<Workspace | null> {
        return await this.workspaceRepository.findOne({ where: { id, isActive: true }, relations: ['owner', 'workspaceMembers', 'boards', 'workspaceMembers.user', 'workspaceMembers.role'] });
    }

    async create(data: Partial<Workspace>): Promise<Workspace> {
        const workspace = this.workspaceRepository.create(data);
        return await this.workspaceRepository.save(workspace);
    }

    async update(id: string, data: Partial<Workspace>): Promise<Workspace> {
        return await this.workspaceRepository.save({ id, ...data });
    }

    async delete(id: string): Promise<any> {
        const workspace = await this.workspaceRepository.findOne({ where: { id } });
        if (!workspace) {
            throw new NotFoundError(`Workspace with ID ${id} not found`);
        }
        workspace.isActive = false;
        return await this.workspaceRepository.save(workspace);
    }
}