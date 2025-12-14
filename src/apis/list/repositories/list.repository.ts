import { List } from "@/common/entities/list.entity";
import { EntityManager, Repository } from "typeorm";
import { IListRepository } from "./list.repository.interface";

export class ListRepository implements IListRepository {
    constructor(private listRepository: Repository<List>) { }

    async findFullListById(id: string, manager?: EntityManager): Promise<List | null> {
        const repo = manager ? manager.getRepository(List) : this.listRepository;
        return await repo.findOne({ where: { id }, relations: ['cards'] });
    }
    async findById(id: string, manager?: EntityManager): Promise<List | null> {
        const repo = manager ? manager.getRepository(List) : this.listRepository;
        return await repo.findOne({ where: { id, isArchived: false }, relations: ['cards'] });
    }
    async findAll(manager?: EntityManager): Promise<List[]> {
        const repo = manager ? manager.getRepository(List) : this.listRepository;
        return await repo.find(
            { where: { isArchived: false }, relations: ['cards'], order: { position: 'ASC' } }
        );
    }
    async findListByTitleAndBoardId(title: string, boardId: string, manager?: EntityManager): Promise<List | null> {
        const repo = manager ? manager.getRepository(List) : this.listRepository;
        return await repo.findOne({ where: { title, boardId, isArchived: false }, relations: ['cards'] });
    }
    async findListsByBoardId(boardId: string, manager?: EntityManager): Promise<List[]> {
        const repo = manager ? manager.getRepository(List) : this.listRepository;
        return await repo.find({
            where: { boardId, isArchived: false },
            relations: ['cards']
        });
    }
    async findListsSortedByPosition(boardId: string, manager?: EntityManager): Promise<List[]> {
        const repo = manager ? manager.getRepository(List) : this.listRepository;
        return await repo.find({
            where: { boardId, isArchived: false },
            relations: ['cards'],
            order: { position: 'ASC' }
        })
    }
    async create(data: Partial<List>, manager?: EntityManager): Promise<List> {
        const repo = manager ? manager.getRepository(List) : this.listRepository;
        const list = repo.create(data);
        return await repo.save(list);
    }
    async update(id: string, data: Partial<List>, manager?: EntityManager): Promise<List> {
        const repo = manager ? manager.getRepository(List) : this.listRepository;
        return await repo.save({ id, ...data });
    }
    async archive(id: string, manager?: EntityManager): Promise<List> {
        const repo = manager ? manager.getRepository(List) : this.listRepository;
        const list = await repo.findOne({ where: { id }, relations: ['cards'] });
        if (!list) {
            throw new Error(`List with ID ${id} not found`);
        }
        list.isArchived = true;
        return await repo.save(list);
    }
    async reopen(id: string, manager?: EntityManager): Promise<List> {
        const repo = manager ? manager.getRepository(List) : this.listRepository;
        const list = await repo.findOne({ where: { id }, relations: ['cards'] });
        if (!list) {
            throw new Error(`List with ID ${id} not found`);
        }
        list.isArchived = false;
        return await repo.save(list);
    }
    async reorder(id: string, position: string, manager?: EntityManager): Promise<List> {
        const repo = manager ? manager.getRepository(List) : this.listRepository;
        const list = await repo.findOne({ where: { id, isArchived: true }, relations: ['cards'] });
        if (!list) {
            throw new Error(`List with ID ${id} not found`);
        }
        list.position = position;
        return await repo.save(list);
    }
    async delete(id: string, manager?: EntityManager): Promise<List> {
        const repo = manager ? manager.getRepository(List) : this.listRepository;
        const list = await repo.findOne({ where: { id }, relations: ['cards'] });
        if (!list) {
            throw new Error(`List with ID ${id} not found`);
        }
        return await repo.remove(list);
    }
}