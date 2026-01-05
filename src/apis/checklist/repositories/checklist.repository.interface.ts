import { Checklist } from "@/common/entities/checklist.entity";
import { EntityManager } from "typeorm";

export interface IChecklistRepository {
    create(data: Partial<Checklist>, manager?: EntityManager): Promise<Checklist>;
    getChecklistById(id: string, manager?: EntityManager): Promise<Checklist | null>;
    getChecklistsByCardId(cardId: string, manager?: EntityManager): Promise<Checklist[]>;
    getChecklistsWithItemsByCardId(cardId: string, manager?: EntityManager): Promise<Checklist[]>;
    update(id: string, data: Partial<Checklist>, manager?: EntityManager): Promise<Checklist>;
    delete(id: string, manager?: EntityManager): Promise<void>;
}