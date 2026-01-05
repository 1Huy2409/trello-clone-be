import { EntityManager, Repository } from "typeorm";
import { IChecklistItemRepository } from "./checklist-item.repository.interface";
import { ChecklistItem } from "@/common/entities/checklist-item.entity";

export class ChecklistItemRepository implements IChecklistItemRepository {
    constructor(
        private readonly checklistItemRepository: Repository<ChecklistItem>
    ) { }

    private getRepo(manager?: EntityManager): Repository<ChecklistItem> {
        return manager ? manager.getRepository(ChecklistItem) : this.checklistItemRepository;
    }

    async findAll(checklistId: string, manager?: EntityManager): Promise<ChecklistItem[]> {
        return await this.getRepo(manager).find({
            where: { checklistId },
            order: { position: 'ASC' }
        });
    }
    async findById(id: string, manager?: EntityManager): Promise<ChecklistItem | null> {
        return await this.getRepo(manager).findOne({ where: { id } });
    }
    async create(data: Partial<ChecklistItem>, manager?: EntityManager): Promise<ChecklistItem> {
        const repo = this.getRepo(manager);
        const checklistItem = repo.create(data);
        return await repo.save(checklistItem);
    }
    async update(id: string, data: Partial<ChecklistItem>, manager?: EntityManager): Promise<ChecklistItem> {
        const repo = this.getRepo(manager);
        await repo.update(id, data);
        const updatedChecklistItem = await this.findById(id, manager);
        if (!updatedChecklistItem) {
            throw new Error('ChecklistItem not found after update');
        }
        return updatedChecklistItem;
    }
    async delete(id: string, manager?: EntityManager): Promise<void> {
        const checklistItem = await this.findById(id, manager);
        if (!checklistItem) {
            throw new Error('ChecklistItem not found');
        }
        await this.getRepo(manager).remove(checklistItem);
    }
}