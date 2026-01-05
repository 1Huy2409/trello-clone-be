import { Checklist } from "@/common/entities/checklist.entity";
import { IChecklistRepository } from "./checklist.repository.interface";
import { EntityManager, Repository } from "typeorm";
import { NotFoundError } from "@/common/handler/error.response";

export class ChecklistRepository implements IChecklistRepository {
    constructor(
        private readonly checklistRepo: Repository<Checklist>
    ) { }
    async create(data: Partial<Checklist>, manager?: EntityManager): Promise<Checklist> {
        const repo = manager ? manager.getRepository(Checklist) : this.checklistRepo;
        const checklist = repo.create(data);
        return await repo.save(checklist);
    }
    async getChecklistById(id: string, manager?: EntityManager): Promise<Checklist | null> {
        const repo = manager ? manager.getRepository(Checklist) : this.checklistRepo;
        const checklist = await repo.findOne({ where: { id } });
        return checklist;
    }
    async getChecklistsByCardId(cardId: string, manager?: EntityManager): Promise<Checklist[]> {
        const repo = manager ? manager.getRepository(Checklist) : this.checklistRepo;
        const checklists = await repo.find({ where: { cardId } });
        return checklists;
    }

    async getChecklistsWithItemsByCardId(cardId: string, manager?: EntityManager): Promise<Checklist[]> {
        const repo = manager ? manager.getRepository(Checklist) : this.checklistRepo;
        return await repo.find({
            where: { cardId },
            relations: ['items'],
        });
    }
    async update(id: string, data: Partial<Checklist>, manager?: EntityManager): Promise<Checklist> {
        const repo = manager ? manager.getRepository(Checklist) : this.checklistRepo;
        await repo.update(id, data);
        const updatedChecklist = await repo.findOne({ where: { id } });
        if (!updatedChecklist) {
            throw new Error('Checklist not found after update');
        }
        return updatedChecklist;
    }
    async delete(id: string, manager?: EntityManager): Promise<void> {
        const repo = manager ? manager.getRepository(Checklist) : this.checklistRepo;
        const checklist = await repo.findOne({ where: { id } });
        if (!checklist) {
            throw new NotFoundError('Checklist not found');
        }
        await repo.remove(checklist);
    }
}