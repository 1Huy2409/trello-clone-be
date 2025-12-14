import { List } from "@/common/entities/list.entity";
import { EntityManager } from "typeorm";
export interface IListRepository {
    findFullListById(id: string, manager?: EntityManager): Promise<List | null>;
    findById(id: string, manager?: EntityManager): Promise<List | null>;
    findAll(manager?: EntityManager): Promise<List[]>;
    findListByTitleAndBoardId(title: string, boardId: string, manager?: EntityManager): Promise<List | null>;
    findListsSortedByPosition(boardId: string, manager?: EntityManager): Promise<List[]>;
    findListsByBoardId(boardId: string, manager?: EntityManager): Promise<List[]>;
    create(data: Partial<List>, manager?: EntityManager): Promise<List>;
    update(id: string, data: Partial<List>, manager?: EntityManager): Promise<List>;
    archive(id: string, manager?: EntityManager): Promise<List>;
    reopen(id: string, manager?: EntityManager): Promise<List>;
    reorder(id: string, position: string, manager?: EntityManager): Promise<List>;
    delete(id: string, manager?: EntityManager): Promise<List>;
}