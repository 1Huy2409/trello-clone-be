import { EntityManager, Repository } from "typeorm";
import { IBoardRepository } from "./board.repository.interface";
import { Board, BoardVisibility, BoardStatus } from "@/common/entities/board.entity";
import { NotFoundError } from "@/common/handler/error.response";
export class BoardRepository implements IBoardRepository {
    constructor(private boardRepository: Repository<Board>) { }

    async findById(id: string, manager?: EntityManager): Promise<Board | null> {
        const repo = manager ? manager.getRepository(Board) : this.boardRepository;
        return await repo.findOne({ where: { id } });
    }

    async findAll(manager?: EntityManager): Promise<Board[]> {
        const repo = manager ? manager.getRepository(Board) : this.boardRepository;
        return await repo.find();
    }

    async findPublicBoards(manager?: EntityManager): Promise<Board[]> {
        const repo = manager ? manager.getRepository(Board) : this.boardRepository;
        return await repo.find({
            where: { visibility: BoardVisibility.PUBLIC, status: BoardStatus.ACTIVE }
        });
    }

    async findPublicBoardById(id: string, manager?: EntityManager): Promise<Board | null> {
        const repo = manager ? manager.getRepository(Board) : this.boardRepository;
        return await repo.findOne({
            where: { id, visibility: BoardVisibility.PUBLIC, status: BoardStatus.ACTIVE }
        });
    }

    async findBoardsByWorkspaceId(workspaceId: string, manager?: EntityManager): Promise<Board[]> {
        const repo = manager ? manager.getRepository(Board) : this.boardRepository;
        return await repo.find({
            where: { workspaceId: workspaceId, status: BoardStatus.ACTIVE }
        });
    }

    async findBoardByWorkspaceId(id: string, workspaceId: string, manager?: EntityManager): Promise<Board | null> {
        const repo = manager ? manager.getRepository(Board) : this.boardRepository;
        return await repo.findOne({
            where: { id, workspaceId: workspaceId, status: BoardStatus.ACTIVE }
        });
    }
    async findByTitleAndWorkspaceId(title: string, workspaceId: string, manager?: EntityManager): Promise<Board | null> {
        const repo = manager ? manager.getRepository(Board) : this.boardRepository;
        return await repo.findOne({
            where: { title, workspaceId: workspaceId, status: BoardStatus.ACTIVE }
        });
    }

    async create(data: Partial<Board>, manager?: EntityManager): Promise<Board> {
        const repo = manager ? manager.getRepository(Board) : this.boardRepository;
        const board = repo.create(data);
        return await repo.save(board);
    }

    async update(id: string, data: Partial<Board>, manager?: EntityManager): Promise<Board> {
        const repo = manager ? manager.getRepository(Board) : this.boardRepository;
        return await repo.save({ id, ...data });
    }

    async delete(id: string, manager?: EntityManager): Promise<any> {
        const repo = manager ? manager.getRepository(Board) : this.boardRepository;
        const board = await repo.findOne({ where: { id } });
        if (!board) {
            throw new NotFoundError(`Board with ID ${id} not found`);
        }
        board.status = BoardStatus.ARCHIVED;
        await repo.save(board);
        return {
            message: 'Board deleted successfully'
        }
    }

    async reopen(id: string, manager?: EntityManager): Promise<any> {
        const repo = manager ? manager.getRepository(Board) : this.boardRepository;
        const board = await repo.findOne({ where: { id } });
        if (!board) {
            throw new NotFoundError(`Board with ID ${id} not found`);
        }
        board.status = BoardStatus.ACTIVE;
        await repo.save(board);
        return {
            message: 'Board reopened successfully'
        }
    }

    async deletePermanent(id: string, manager?: EntityManager): Promise<any> {
        const repo = manager ? manager.getRepository(Board) : this.boardRepository;
        const board = await repo.findOne({ where: { id } });
        if (!board) {
            throw new NotFoundError(`Board with ID ${id} not found`);
        }
        await repo.delete(id);
        return {
            message: 'Board permanently deleted'
        }
    }

    async changeOwner(id: string, ownerId: string, manager?: EntityManager): Promise<Board> {
        const repo = manager ? manager.getRepository(Board) : this.boardRepository;
        const board = await repo.findOne({ where: { id } });
        if (!board) {
            throw new NotFoundError(`Board with ID ${id} not found`);
        }
        board.ownerId = ownerId;
        return await repo.save(board);
    }
}