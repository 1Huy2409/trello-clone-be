import { Card } from "@/common/entities/card.entity";
import { EntityManager } from "typeorm";

export interface ICardRepository {
    create(data: Partial<Card>, manager?: EntityManager): Promise<Card>;
    getActiveCardById(id: string): Promise<Card | null>;
    getArchivedCardsByListId(listId: string): Promise<Card[]>;
    getCardById(id: string): Promise<Card | null>;
    getCardsByListId(listId: string): Promise<Card[]>;
    update(id: string, data: Partial<Card>, manager?: EntityManager): Promise<Card>;
    // delete(id: string, manager?: EntityManager): Promise<void>;
}