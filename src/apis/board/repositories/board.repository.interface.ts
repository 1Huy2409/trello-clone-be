import { IBaseRepository } from "@/common/repositories/base.repository.interface";
import { Board } from "@/common/entities/board.entity";
import { EntityManager } from "typeorm";
export interface IBoardRepository extends IBaseRepository<Board> {
    findById(id: string, manager?: EntityManager): Promise<Board | null>;
    findAll(manager?: EntityManager): Promise<Board[]>;
    findPublicBoards(manager?: EntityManager): Promise<Board[]>;
    findPublicBoardById(id: string, manager?: EntityManager): Promise<Board | null>;
    findBoardsByWorkspaceId(workspaceId: string, manager?: EntityManager): Promise<Board[]>;
    findBoardByWorkspaceId(id: string, workspaceId: string, manager?: EntityManager): Promise<Board | null>;
    findByTitleAndWorkspaceId(title: string, workspaceId: string, manager?: EntityManager): Promise<Board | null>;
    create(data: Partial<Board>, manager?: EntityManager): Promise<Board>;
    update(id: string, data: Partial<Board>, manager?: EntityManager): Promise<Board>;
    delete(id: string, manager?: EntityManager): Promise<any>;
    reopen(id: string, manager?: EntityManager): Promise<any>;
    deletePermanent(id: string, manager?: EntityManager): Promise<any>;
    changeOwner(id: string, ownerId: string, manager?: EntityManager): Promise<Board>;
}