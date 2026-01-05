import { EntityManager } from "typeorm";
import { ChecklistItem } from "@/common/entities/checklist-item.entity";

export interface IChecklistItemRepository {
    findAll(checklistId: string, manager?: EntityManager): Promise<ChecklistItem[]>;
    findById(id: string, manager?: EntityManager): Promise<ChecklistItem | null>;
    create(data: Partial<ChecklistItem>, manager?: EntityManager): Promise<ChecklistItem>;
    update(id: string, data: Partial<ChecklistItem>, manager?: EntityManager): Promise<ChecklistItem>;
    delete(id: string, manager?: EntityManager): Promise<void>;
}